
import Logger from '../logger.js';
export const memoryCache = new Map();

const circuitState = {
  failures: 0,
  lastFailureTime: 0,
  open: false,
};

export async function request(endpoint, method, data = null, options = {}) {
  const {
    params,
    timeout,
    retryCount = 0,
    retryDelay = 300,
    onRequest,
    onResponse,
    responseType,
    authToken,
    cacheKey,
    skipErrorLog = false,
    transformData,
    onError,
    metricsLabel,
    circuitBreaker,
    progressCb,         
    uploadProgressCb,   
    ...fetchOptions
  } = options;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    endpoint += endpoint.includes('?') ? '&' + qs : '?' + qs;
  }

  if (circuitBreaker && circuitState.open) {
    const timeSince = Date.now() - circuitState.lastFailureTime;
    if (timeSince < circuitBreaker.resetTimeout) {
      const err = new Error('Circuit breaker is open');
      if (onError) onError(err);
      throw err;
    } else {
      circuitState.open = false;
      circuitState.failures = 0;
    }
  }

  if (cacheKey && memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  if ('offlineFallback' in options && !navigator.onLine) {
    const fb = typeof options.offlineFallback === 'function'
      ? options.offlineFallback()
      : options.offlineFallback;
    return fb;
  }

  const controller = new AbortController();
  if (timeout > 0) {
    setTimeout(() => controller.abort(), timeout);
  }

  const config = {
    method,
    headers: {
      'Content-Type': data && !(data instanceof Blob) ? 'application/json' : undefined,
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...(options.requestId ? { 'X-Request-Id': options.requestId } : {}),
      ...fetchOptions.headers,
    },
    credentials: fetchOptions.credentials || 'same-origin',
    mode: fetchOptions.mode || 'cors',
    cache: fetchOptions.cache || 'default',
    redirect: fetchOptions.redirect || 'follow',
    referrerPolicy: fetchOptions.referrerPolicy || 'no-referrer-when-downgrade',
    signal: fetchOptions.signal || controller.signal,
    ...fetchOptions,
  };

  const isUpload = uploadProgressCb && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT');
  if (isUpload && data instanceof Blob) {

    const total = data.size;
    let uploaded = 0;
    const chunkSize = Math.ceil(total / 20); 
    for (let start = 0; start < total; start += chunkSize) {
      const slice = data.slice(start, start + chunkSize);
  
      await fetch(endpoint, {
        method,
        headers: {
       
          ...config.headers,
          'Content-Type': slice.type || 'application/octet-stream'
        },
        body: slice,
        signal: config.signal,
      });
      uploaded += slice.size;
      try {
        uploadProgressCb(uploaded, total);
      } catch (hookErr) {
        Logger.warn('Ошибка в uploadProgressCb:', hookErr);
      }
    }

    return { success: true };
  }


  let payload = null;
  if (data !== null && method.toUpperCase() !== 'GET') {
    const toSend = transformData ? transformData(data) : data;
    payload = toSend;
    config.body = JSON.stringify(payload);
  }

  if (typeof onRequest === 'function') {
    try {
      onRequest(config, endpoint);
    } catch (hookErr) {
      Logger.warn('Ошибка в onRequest-хуке:', hookErr);
    }
  }

  if (metricsLabel) {
    console.time(`Request ${metricsLabel}`);
  }

  async function tryRequest(attempt = 0) {
    try {
      const response = await fetch(endpoint, config);

      if (typeof onResponse === 'function') {
        try {
          onResponse(response);
        } catch (hookErr) {
          Logger.warn('Ошибка в onResponse-хуке:', hookErr);
        }
      }

      if (Array.isArray(options.ignoreStatus) && options.ignoreStatus.includes(response.status)) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      if (progressCb && response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length') || 0;
        let received = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          try {
            progressCb(received, contentLength);
          } catch (hookErr) {
            Logger.warn('Ошибка в progressCb:', hookErr);
          }
        }

        const blob = new Blob(chunks);
        if (responseType === 'blob') return blob;
        if (responseType === 'text') return await blob.text();
        if (responseType === 'formData') {
          const text = await blob.text();
          return new URLSearchParams(text);
        }
        const text = await blob.text();
        return JSON.parse(text);
      }

      let result;
      switch (responseType) {
        case 'text':
          result = await response.text();
          break;
        case 'blob':
          result = await response.blob();
          break;
        case 'formData':
          result = await response.formData();
          break;
        default:
          result = await response.json();
      }

      if (cacheKey) {
        memoryCache.set(cacheKey, result);
      }

      if (metricsLabel) {
        console.timeEnd(`Request ${metricsLabel}`);
      }

      if (circuitBreaker) {
        circuitState.failures = 0;
        circuitState.open = false;
      }

      return result;
    } catch (err) {

      if (err.name === 'AbortError') {
        const msg = `Запрос отменён по таймауту (${timeout} ms): ${endpoint}`;
        if (!skipErrorLog) Logger.error(msg);
        if (onError) onError(err);
        throw err;
      }

      if (attempt < retryCount) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        return tryRequest(attempt + 1);
      }

      if (circuitBreaker) {
        circuitState.failures += 1;
        circuitState.lastFailureTime = Date.now();
        if (circuitState.failures >= circuitBreaker.failureThreshold) {
          circuitState.open = true;
        }
      }

      const errMsg = `Ошибка при выполнении ${method}-запроса: ${err.message}`;
      if (!skipErrorLog) Logger.error(errMsg, err.stack);
      if (onError) onError(err);
      throw err;
    }
  }

  return tryRequest();
}

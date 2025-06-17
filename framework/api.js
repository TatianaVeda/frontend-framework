import { request } from 'framework/utils/request.js';
import { Config } from 'framework/config.js';

export function getData(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : Config.api.baseUrl + endpoint;
  return request(url, 'GET', null, {
    headers: { ...Config.api.defaultHeaders, ...options.headers },
    ...options
  });
}

export function postData(endpoint, data, options = {}) {
  return request(Config.api.baseUrl + endpoint, 'POST', data, {
    headers: { ...Config.api.defaultHeaders, ...options.headers },
    ...options
  });
}

export function putData(endpoint, data, options = {}) {
  return request(Config.api.baseUrl + endpoint, 'PUT', data, {
    headers: { ...Config.api.defaultHeaders, ...options.headers },
    ...options
  });
}
export function patchData(endpoint, data, options = {}) {
  return request(Config.api.baseUrl + endpoint, 'PATCH', data, {
    headers: { ...Config.api.defaultHeaders, ...options.headers },
    ...options
  });
}
export function deleteData(endpoint, data = null, options = {}) {
  return request(Config.api.baseUrl + endpoint, 'DELETE', data, {
    headers: { ...Config.api.defaultHeaders, ...options.headers },
    ...options
  });
}

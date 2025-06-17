const globalState = {};
if (globalState.iconClicks === undefined) {
  globalState.iconClicks = {};
}
const componentStates = new Map();
const subscribers = new Map();
let batchUpdateQueue = null;
let dependencyCollector = null;

export function beginDependencyCollection(depsSet) {
  dependencyCollector = depsSet;
}

export function endDependencyCollection() {
  dependencyCollector = null;
}

export function getState(key) {
  if (dependencyCollector) {
    dependencyCollector.add(key);
  }
  return globalState[key];
}

export function setState(key, value) {
  if (typeof key === 'object' && key !== null) {
    for (const [k, v] of Object.entries(key)) {
      internalSetState(k, v);
    }
  } else {
    internalSetState(key, value);
  }
}

function internalSetState(key, value) {
  if (globalState[key] === value) return;
  globalState[key] = value;
  if (!batchUpdateQueue) {
    batchUpdateQueue = new Set();
    Promise.resolve().then(() => {
      batchUpdateQueue.forEach(k => notifySubscribers(k, globalState[k]));
      batchUpdateQueue = null;
    });
  }
  batchUpdateQueue.add(key);
}

export function getComponentState(componentId, key) {
  if (!componentStates.has(componentId)) return undefined;
  return componentStates.get(componentId)[key];
}

export function setComponentState(componentId, key, value) {
  if (!componentStates.has(componentId)) {
    componentStates.set(componentId, {});
  }
  const componentState = componentStates.get(componentId);
  if (componentState[key] !== value) {
    componentState[key] = value;
    notifySubscribers(`${componentId}:${key}`, value);
  }
}

export function subscribe(keys, callback) {
  if (typeof keys === 'string') {
    if (keys === '*') {
      if (!subscribers.has('*')) {
        subscribers.set('*', []);
      }
      subscribers.get('*').push(callback);
    } else {
      if (!subscribers.has(keys)) {
        subscribers.set(keys, []);
      }
      subscribers.get(keys).push(callback);
    }
  } else if (Array.isArray(keys)) {
    if (keys.includes('*')) {
      subscribe('*', callback);
    } else {
      keys.forEach(key => {
        subscribe(key, callback);
      });
    }
  } else {
    throw new Error("Ключ подписки должен быть строкой или массивом строк");
  }
}

export function unsubscribe(keys, callback) {
  if (typeof keys === 'string') {
    if (!subscribers.has(keys)) return;
    const keySubscribers = subscribers.get(keys);
    const index = keySubscribers.indexOf(callback);
    if (index !== -1) {
      keySubscribers.splice(index, 1);
    }
  } else if (Array.isArray(keys)) {
    keys.forEach(key => unsubscribe(key, callback));
  } else {
    throw new Error("Ключ подписки должен быть строкой или массивом строк");
  }
}

function notifySubscribers(key, value) {
  const keySubscribers = subscribers.get(key) || [];
  keySubscribers.forEach(callback => callback(value));
  const globalSubscribers = subscribers.get('*') || [];
  globalSubscribers.forEach(callback => callback({ key, value }));
}


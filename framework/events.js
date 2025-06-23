import { Config } from 'framework/config.js';

const eventRegistry = new WeakMap();
const globalEventRegistry = new Map();

export function createCustomEvent(name, detail = {}, options = {}) {
  const eventOptions = Object.assign({ bubbles: true, cancelable: true }, options);
  return new CustomEvent(name, { detail, ...eventOptions });
}

export function dispatchCustomEvent(element, name, detail = {}, options = {}) {
  const event = createCustomEvent(name, detail, options);
  element.dispatchEvent(event);
}

export function delegateEvent(parent, eventType, selector, handler, options = {}) {
  const {
    once = false,
    capture = false,
    preventDefault = false,
    global = false,
    namespace = '',
    throttle = Config.events.defaultThrottleDelay,
    debounce,
    priority = 0
  } = options;

  const container = global ? document : parent;
  let wrappedHandler = handler;

  if (typeof throttle === 'number' && throttle > 0) {
    wrappedHandler = throttleFunction(handler, throttle);
  } else if (typeof debounce === 'number') {
    wrappedHandler = debounceFunction(handler, debounce);
  }

  function eventListener(event) {
    try {
      if (event.target.matches(selector) || event.target.closest(selector)) {
        if (preventDefault) {
          event.preventDefault();
        }
        wrappedHandler(event);
        if (once) {
          removeDelegateEvent(parent, eventType, selector, eventListener);
        }
      }
    } catch (err) {
      console.error(`Error in event handler ${eventType}:`, err);
    }
  }

  eventListener.namespace = namespace;
  eventListener.priority = priority;
  eventListener.global = global;

  container.addEventListener(eventType, eventListener, capture);
  storeEvent(parent, eventType, selector, eventListener);
  return eventListener;
}

export function removeDelegateEvent(parent, eventType, selector, eventListener) {
  const container = eventListener.global ? document : parent;
  container.removeEventListener(eventType, eventListener);
  removeStoredEvent(parent, eventType, selector, eventListener);
}

export function removeAllDelegateEvents(parent, eventType = null) {
  if (!eventRegistry.has(parent)) return;
  const eventMap = eventRegistry.get(parent);

  for (const [key, listeners] of eventMap.entries()) {
    if (!eventType || key.startsWith(eventType)) {
      listeners.forEach(({ selector, listener }) => {
        parent.removeEventListener(key.split(':')[0], listener);
      });
      eventMap.delete(key);
    }
  }
}

export function removeDelegateEventsByNamespace(parent, namespace) {
  if (!eventRegistry.has(parent)) return;
  const eventMap = eventRegistry.get(parent);

  for (const [key, listeners] of eventMap.entries()) {
    const [eventType] = key.split(':');
    const toRemove = listeners.filter(item => item.listener.namespace === namespace);

    toRemove.forEach(({ listener }) => {
      parent.removeEventListener(eventType, listener);
    });

    const remaining = listeners.filter(item => item.listener.namespace !== namespace);
    if (remaining.length > 0) {
      eventMap.set(key, remaining);
    } else {
      eventMap.delete(key);
    }
  }
}

function storeEvent(parent, eventType, selector, listener) {
  if (!eventRegistry.has(parent)) {
    eventRegistry.set(parent, new Map());
  }
  const eventMap = eventRegistry.get(parent);
  const key = `${eventType}:${selector}`;
  if (!eventMap.has(key)) {
    eventMap.set(key, []);
  }
  eventMap.get(key).push({ selector, listener, priority: listener.priority || 0 });
}

function removeStoredEvent(parent, eventType, selector, listener) {
  if (!eventRegistry.has(parent)) return;
  const eventMap = eventRegistry.get(parent);
  const key = `${eventType}:${selector}`;
  if (eventMap.has(key)) {
    const listeners = eventMap.get(key);
    eventMap.set(key, listeners.filter(item => item.listener !== listener));
    if (eventMap.get(key).length === 0) {
      eventMap.delete(key);
    }
  }
}

function throttleFunction(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

function debounceFunction(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export const EventBus = {
  _events: {},
  on(eventName, handler) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(handler);
  },
  off(eventName, handler) {
    if (!this._events[eventName]) return;
    this._events[eventName] = this._events[eventName].filter(h => h !== handler);
  },
  emit(eventName, data) {
    if (!this._events[eventName]) return;
    this._events[eventName].forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in event handler ${eventName}:`, err);
      }
    });
  }
};

export function fromEvent(eventName) {
  return {
    subscribe(handler) {
      EventBus.on(eventName, handler);
      return {
        unsubscribe() {
          EventBus.off(eventName, handler);
        }
      };
    }
  };
}

export function preventDefault(event) {
  event.preventDefault();
}

export function onEvent(eventType, selector, handler, options = {}) {
  if (!globalEventRegistry.has(eventType)) {
    globalEventRegistry.set(eventType, []);
    document.addEventListener(eventType, (event) => {
      const handlers = globalEventRegistry.get(eventType).slice().sort((a, b) => b.priority - a.priority);
      handlers.forEach(({ selector, handler }) => {
        if (event.target.matches(selector) || event.target.closest(selector)) {
          try {
            handler(event);
          } catch (err) {
            console.error(`Error in global event handler ${eventType}:`, err);
          }
        }
      });
    });
  }
  const priority = options.priority || 0;
  globalEventRegistry.get(eventType).push({ selector, handler, options, priority });
}

export function offEvent(eventType, selector) {
  if (globalEventRegistry.has(eventType)) {
    const handlers = globalEventRegistry.get(eventType);
    globalEventRegistry.set(eventType, handlers.filter(item => item.selector !== selector));
  }
}

const MODE_LABELS = {
  light:  '🌞 Light',
  dark:   '🌙 Dark',
  custom: '🎨 Custom',
  auto:   '🌓 Auto'
};

// /dot-js/framework/router.js

import { Config } from 'framework/config.js';
import Logger from 'framework/logger.js';

let routes = {};
let notFoundHandler = Config.router.defaultNotFoundHandler;
let beforeEnterHooks = new Map();
let afterLeaveHooks = new Map();
let currentPath = null;

function animateTransition(element, className) {
  return new Promise(resolve => {
    element.classList.add(className);
    element.addEventListener(
      'transitionend',
      function handler(e) {
        if (e.target === element && e.propertyName === 'opacity') {
          element.removeEventListener('transitionend', handler);
          resolve();
        }
      },
      { once: true }
    );
  });
}

function removeTransitionClass(element, className) {
  element.classList.remove(className);
}

export function registerRoute(path, callback) {
  const paramNames = [];
  const regexPath = path.replace(/:([^\/]+)/g, (_, key) => {
    paramNames.push(key);
    return "([^\\/]+)";
  });
  routes[path] = { regex: new RegExp(`^${regexPath}$`), callback, paramNames };
  Logger.debug(`Route registered: ${path}`);
}

export function registerNotFound(callback) {
  notFoundHandler = callback;
}

export function registerHooks(path, { beforeEnter = null, afterLeave = null } = {}) {
  if (beforeEnter) beforeEnterHooks.set(path, beforeEnter);
  if (afterLeave) afterLeaveHooks.set(path, afterLeave);
}

export async function navigateTo(path, replace = false) {
  const fullPath = Config.router.basePath + path;
  Logger.debug(`Transition to route: ${fullPath}`);

  const container = document.querySelector(Config.router.containerSelector);

  if (currentPath && afterLeaveHooks.has(currentPath)) {
    try {
      let result = afterLeaveHooks.get(currentPath)();
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      Logger.error(`Error in afterLeave hook for "${currentPath}":`, err);
    }
  }

  if (container) {
    try {
      await animateTransition(container, 'fade-out');
      removeTransitionClass(container, 'fade-out');
    } catch (err) {
      Logger.error('Error in fade-out animation:', err);
    }
  }

  if (beforeEnterHooks.has(fullPath)) {
    try {
      let proceed = beforeEnterHooks.get(fullPath)();
      if (proceed instanceof Promise) {
        proceed = await proceed;
      }
      if (proceed === false) return;
    } catch (err) {
      Logger.error(`Error in beforeEnter hook for "${fullPath}":`, err);
      return;
    }
  }

  if (replace) {
    window.history.replaceState({}, "", window.location.origin + fullPath);
  } else {
    window.history.pushState({}, "", window.location.origin + fullPath);
  }
  resolveRoute();

  if (container) {
    try {
      removeTransitionClass(container, 'fade-out');
      await animateTransition(container, 'fade-in');
      removeTransitionClass(container, 'fade-in');
    } catch (err) {
      Logger.error('Error in fade-in animation:', err);
    }
  }
}

export function resolveRoute() {
  const basePath = Config.router.basePath;
  let path = window.location.pathname;
  if (basePath && path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }
  currentPath = path;
  const queryString = window.location.search;
  const query = Object.fromEntries(new URLSearchParams(queryString));

  for (const route in routes) {
    const { regex, callback, paramNames } = routes[route];
    const match = path.match(regex);
    if (match) {
      const params = Object.fromEntries(paramNames.map((name, i) => [name, match[i + 1]]));
      try {
        return callback({ params, query });
      } catch (err) {
        Logger.error(`Error in route "${route}" with parameters`, { params, query }, err);
        return;
      }
    }
  }

  if (notFoundHandler) {
    try {
      notFoundHandler();
    } catch (err) {
      Logger.error(`Error in notFoundHandler for route "${path}":`, err);
    }
  } else {
    Logger.error(`❌ Route not found: ${path}`);
  }
}

export const Router = {
  registerRoute,
  registerNotFound,
  registerHooks,
  navigateTo,
};

window.addEventListener("popstate", resolveRoute);
window.navigateTo = navigateTo;
document.addEventListener("DOMContentLoaded", resolveRoute);

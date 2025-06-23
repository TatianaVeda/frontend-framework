import {
  Router,
  registerRoute,
  registerNotFound,
  navigateTo
} from 'framework/router.js';
import { initPersistentState } from 'framework/persistentState.js';
import {
  renderComponent,
  defineComponent,
  bindComponentToStateWithDeps
} from 'framework/components.js';
import { registerHooks } from 'framework/router.js';
import { getState, setState, subscribe } from 'framework/state.js';
import { applyTheme } from 'framework/dom.js';
import { Config } from 'framework/config.js';

import { IconDemo } from './components/IconDemo.js';
import { TimeTracker } from './components/timeTracker.js';
import { QueueManager } from './components/queueManager.js';
import { PerformanceDashboard } from './components/performanceDashboard.js';
import { APIDemo } from './components/APIDemo.js';
import { EventsDemo } from './components/EventsDemo.js';
import { DOMUtilsDemo } from './components/DOMUtilsDemo.js';
import { FormDemo } from './components/FormDemo.js';
import { IconDetail } from './components/IconDetail.js';
import { ThemeSwitcher } from './components/ThemeSwitcher.js';

import { Chat } from './components/extra/Chat.js';
import { FileProgressDemo } from './components/extra/FileProgressDemo.js';

// Initialize state persistence (loads saved state, subscribes to changes)
initPersistentState();

// Initialize themeMode and customTheme in state if not already set
if (getState('themeMode') === undefined) {
  setState('themeMode', Config.theme.default);
}
if (getState('customTheme') === undefined) {
  setState('customTheme', Config.theme.vars.custom || {});
}

/**
 * Resolves the actual CSS variable map for the current theme mode.
 *
 * @param {string} mode - 'light', 'dark', 'custom', or 'auto'
 * @param {object} customVars - Custom theme variables from state
 * @returns {object} Map of CSS variables to apply
 */
function resolveThemeVars(mode, customVars) {
  // Auto-detect system preference if in 'auto' mode
  if (mode === 'auto' && Config.theme.autoDetect) {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    mode = darkMq.matches ? 'dark' : 'light';

    // Listen for system theme changes and reapply if still in auto mode
    darkMq.addEventListener('change', () => {
      if (getState('themeMode') === 'auto') {
        applyTheme(resolveThemeVars('auto', getState('customTheme')));
      }
    });
  }

  // If custom mode, use the provided custom variables
  if (mode === 'custom') {
    return customVars || {};
  }

  // Otherwise return the predefined vars for light or dark
  return Config.theme.vars[mode] || {};
}

// Subscribe to themeMode changes and apply the new theme
subscribe('themeMode', () => {
  const mode = getState('themeMode');
  const custom = getState('customTheme');
  applyTheme(resolveThemeVars(mode, custom));
});

// Subscribe to customTheme changes when in custom mode
subscribe('customTheme', () => {
  if (getState('themeMode') === 'custom') {
    applyTheme(getState('customTheme'));
  }
});

// Immediately apply the current theme on startup
(() => {
  const mode = getState('themeMode');
  const custom = getState('customTheme');
  applyTheme(resolveThemeVars(mode, custom));
})();

// Icon key → source URL map
const ICON_SRC_MAP = {
  android192: '/android-chrome-192x192.png',
  android512: '/android-chrome-512x512.png',
  apple: '/apple-touch-icon.png',
  fav16: '/favicon-16x16.png',
  fav32: '/favicon-32x32.png'
};

let currentComponent = null;

// Register route-specific hooks for '/queue'
registerHooks('/queue', {
  beforeEnter: () => {
    const existing = getState('queue');
    // If queue not initialized or empty, populate with defaults
    if (!Array.isArray(existing) || existing.length === 0) {
      setState('queue', [
        { id: 1, text: 'Auto item 1', isEditing: false },
        { id: 2, text: 'Auto item 2', isEditing: false }
      ]);
    }
    return true;
  },
  afterLeave: () => {
    console.info('Leaving the queue page');
  }
});

// Define the Home component
defineComponent('Home', () => ({
  tag: 'div',
  props: { class: 'page' },
  children: [
    { tag: 'h2', children: 'Welcome!' },
    {
      tag: 'button',
      events: {
        click: (event) => {
          const msgs = getState('notifications') || [];
          setState('notifications', [...msgs, 'New notification from Home']);
          window.navigateTo('/events-demo', event);
        }
      },
      children: 'Add notification and navigate'
    }
  ]
}));

// Register named components
defineComponent('TimeTracker', TimeTracker);
defineComponent('QueueManager', QueueManager);
defineComponent('PerformanceDashboard', PerformanceDashboard);
defineComponent('APIDemo', APIDemo);
defineComponent('EventsDemo', EventsDemo);
defineComponent('DOMUtilsDemo', DOMUtilsDemo);
defineComponent('FormDemo', FormDemo);
defineComponent('IconDemo', IconDemo);
defineComponent('IconDetail', IconDetail);
defineComponent('ThemeSwitcher', ThemeSwitcher);
defineComponent('Chat', Chat);
defineComponent('FileProgressDemo', FileProgressDemo);

// Register application routes and render/unmount logic
registerRoute('/', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('Home', {}, app);
});

registerRoute('/time-tracker', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('TimeTracker', {}, app);
});

registerRoute('/queue', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  currentComponent = bindComponentToStateWithDeps('QueueManager', {}, app);
});

registerRoute('/performance', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  currentComponent = bindComponentToStateWithDeps('PerformanceDashboard', {}, app);
});

registerRoute('/api-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('APIDemo', {}, app);
});

registerRoute('/events-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('EventsDemo', {}, app);
});

registerRoute('/dom-utils-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('DOMUtilsDemo', {}, app);
});

registerRoute('/form-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('FormDemo', {}, app);
});

registerRoute('/icons', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('IconDemo', {}, app);
});

// Route with dynamic :key parameter for icon detail
registerRoute('/icons/:key', (route) => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();

  const iconKey = route.state?.key ?? route.params.key;
  let src = ICON_SRC_MAP[iconKey];

  if (!src) {
    // Check user-uploaded icons if not in default map
    const uploads = getState('userIcons') || [];
    const found = uploads.find(item => item.key === iconKey);
    src = found?.src || null;
  }

  if (!src) {
    app.innerHTML = '<h2>Icon not found</h2>';
    return;
  }

  const clicks = (getState('iconClicks') || {})[iconKey] || 0;
  renderComponent('IconDetail', { key: iconKey, src, clicks }, app);
});

registerRoute('/chat', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  currentComponent = bindComponentToStateWithDeps('Chat', {}, app);
});

registerRoute('/file-progress', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  currentComponent = bindComponentToStateWithDeps('FileProgressDemo', {}, app);
});

registerRoute('/theme-switcher', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  currentComponent = bindComponentToStateWithDeps('ThemeSwitcher', {}, app);
});

// Handle unknown routes
registerNotFound(() => {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Page not found</h2>';
});

/**
 * Overrides window.navigateTo for link clicks to handle SPA navigation:
 * - Prevents default link behavior
 * - Unmounts current component
 * - Clears container, updates history, and delegates to router.navigateTo
 */
window.navigateTo = function(path, event) {
  if (event) event.preventDefault();
  if (currentComponent?.unmount) currentComponent.unmount();
  const app = document.getElementById('app');
  app.innerHTML = '';
  history.pushState({}, '', path);
  navigateTo(path);
};


import { Router, registerRoute, registerNotFound, navigateTo } from 'framework/router.js';
import { initPersistentState } from 'framework/persistentState.js';
import { renderComponent, defineComponent, bindComponentToStateWithDeps } from 'framework/components.js';
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

// дополнительные демо-компоненты
import { Chat } from './components/extra/Chat.js';
import { FileProgressDemo } from './components/extra/FileProgressDemo.js';

initPersistentState();

// ——— Логика автодетекта и реакции на смену темы ———

// Инициализация state для темы, если ещё не задано
if (getState('themeMode') === undefined) {
  setState('themeMode', Config.theme.default);
}
if (getState('customTheme') === undefined) {
  setState('customTheme', Config.theme.vars.custom || {});
}

// Функция, возвращающая набор CSS-переменных для режима
function resolveThemeVars(mode, customVars) {
  // авто-режим по prefers-color-scheme
  if (mode === 'auto' && Config.theme.autoDetect) {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    mode = darkMq.matches ? 'dark' : 'light';
    // слушаем изменение системных настроек
    darkMq.addEventListener('change', () => {
      if (getState('themeMode') === 'auto') {
        applyTheme(resolveThemeVars('auto', getState('customTheme')));
      }
    });
  }
  // кастомная тема
  if (mode === 'custom') {
    return customVars || {};
  }
  // светлая или тёмная
  return Config.theme.vars[mode] || {};
}

// подписываемся на смену режима темы
subscribe('themeMode', () => {
  const mode   = getState('themeMode');
  const custom = getState('customTheme');
  applyTheme(resolveThemeVars(mode, custom));
});
// подписываемся на изменение палитры, если активен режим custom
subscribe('customTheme', () => {
  if (getState('themeMode') === 'custom') {
    applyTheme(getState('customTheme'));
  }
});
// сразу применяем текущие настройки
(() => {
  const mode   = getState('themeMode');
  const custom = getState('customTheme');
  applyTheme(resolveThemeVars(mode, custom));
})();

// ——— конец темы ———

const ICON_SRC_MAP = {
  android192: '/android-chrome-192x192.png',
  android512: '/android-chrome-512x512.png',
  apple:      '/apple-touch-icon.png',
  fav16:      '/favicon-16x16.png',
  fav32:      '/favicon-32x32.png'
};

let currentComponent = null;

registerHooks('/queue', {
  beforeEnter: () => {
    const existing = getState('queue');
    if (!Array.isArray(existing) || existing.length === 0) {
      setState('queue', [
        { id: 1, text: 'Автоэлемент 1', isEditing: false },
        { id: 2, text: 'Автоэлемент 2', isEditing: false }
      ]);
    }
    return true;
  },
  afterLeave: () => {
    console.info('Покидаем страницу очереди');
  }
});

defineComponent('Home', () => ({
  tag: 'div',
  props: { class: 'page' },
  children: [
    { tag: 'h2', children: 'Добро пожаловать!' },
    {
      tag: 'button',
      events: {
        click: (event) => {
          const msgs = getState('notifications') || [];
          setState('notifications', [...msgs, 'Новая нотификация из Home']);
          window.navigateTo('/events-demo', event);
        }
      },
      children: 'Добавить уведомление и перейти'
    }
  ]
}));

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

registerRoute('/icons/:key', (route) => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();

  const iconKey = route.state?.key ?? route.params.key;
  let src = ICON_SRC_MAP[iconKey];

  if (!src) {
    const uploads = getState('userIcons') || [];
    const found  = uploads.find(item => item.key === iconKey);
    src = found?.src || null;
  }

  if (!src) {
    app.innerHTML = '<h2>Иконка не найдена</h2>';
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

registerNotFound(() => {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Страница не найдена</h2>';
});

window.navigateTo = function(path, event) {
  if (event) event.preventDefault();
  if (currentComponent?.unmount) currentComponent.unmount();
  const app = document.getElementById('app');
  app.innerHTML = '';
  history.pushState({}, '', path);
  navigateTo(path);
};

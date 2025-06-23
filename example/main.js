import { registerRoute, registerNotFound, navigateTo } from 'framework/router.js';
import { initPersistentState } from 'framework/persistentState.js';
import { renderComponent, defineComponent, bindComponentToStateWithDeps } from 'framework/components.js';
import { registerHooks } from 'framework/router.js';
import { getState, setState } from 'framework/state.js';
import { IconDemo } from './components/IconDemo.js';

import { TimeTracker } from './components/timeTracker.js';
import { TaskManager } from './components/queueManager.js';
import { PerformanceDashboard } from './components/performanceDashboard.js';
import { APIDemo } from './components/APIDemo.js';
import { EventsDemo } from './components/EventsDemo.js';
import { DOMUtilsDemo } from './components/DOMUtilsDemo.js';
import { FormDemo } from './components/FormDemo.js';
import { IconDetail } from './components/IconDetail.js';

// Импорт новых компонентов (пусть они лежат, например, в папке example/components/extra/)
import { Chat } from './components/extra/Chat.js';
import { FileProgressDemo } from './components/extra/FileProgressDemo.js';

// Новые компоненты
import { initWeatherWidget } from './components/WeatherWidget.js';

//WORK

// import { ThemeSwitcher } from './components/extra/ThemeSwitcher.js';
// import { HeavyComponent } from './components/extra/HeavyComponent.js';
// import { OfflineDemo } from './components/extra/OfflineDemo.js';
// import { UndoRedoDemo } from './components/extra/UndoRedoDemo.js';
// import { ValidatedForm } from './components/extra/ValidatedForm.js';
// import { I18nDemo } from './components/extra/I18nDemo.js';
// import { Calendar } from 'framework/plugins/calendar.js'; // если плагин оттуда

// Инициализация persistent state для сохранения состояния между сессиями
initPersistentState();

const ICON_SRC_MAP = {
  android192: '/android-chrome-192x192.png',
  android512: '/android-chrome-512x512.png',
  apple:     '/apple-touch-icon.png',
  fav16:     '/favicon-16x16.png',
  fav32:     '/favicon-32x32.png'
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
defineComponent('QueueManager', TaskManager);
defineComponent('TaskManager', TaskManager);
defineComponent('PerformanceDashboard', PerformanceDashboard);
defineComponent('APIDemo', APIDemo);
defineComponent('EventsDemo', EventsDemo);
defineComponent('DOMUtilsDemo', DOMUtilsDemo);
defineComponent('FormDemo', FormDemo);
defineComponent('IconDemo', IconDemo);
defineComponent('IconDetail', IconDetail);

// Регистрируем каждый новый компонент
defineComponent('Chat', Chat);
defineComponent('FileProgressDemo', FileProgressDemo);
//WORK
// 
// defineComponent('ThemeSwitcher', ThemeSwitcher);
// defineComponent('HeavyComponent', HeavyComponent);
// defineComponent('OfflineDemo', OfflineDemo);
// defineComponent('UndoRedoDemo', UndoRedoDemo);
// defineComponent('ValidatedForm', ValidatedForm);
// defineComponent('I18nDemo', I18nDemo);
// defineComponent('Calendar', Calendar);

registerRoute('/', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('Home', {}, app);
});

registerRoute('/time-tracker', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('TimeTracker', {}, app);
});

// Оставляем для обратной совместимости, но рендерим TaskManager
registerRoute('/queue', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  currentComponent = bindComponentToStateWithDeps('TaskManager', {}, app);
});

// Новый маршрут для Task Manager
registerRoute('/task-manager', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  currentComponent = bindComponentToStateWithDeps('TaskManager', {}, app);
});

registerRoute('/performance', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  currentComponent = bindComponentToStateWithDeps('PerformanceDashboard', {}, app);
});

registerRoute('/api-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('APIDemo', {}, app);
});

registerRoute('/events-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('EventsDemo', {}, app);
});

registerRoute('/dom-utils-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('DOMUtilsDemo', {}, app);
});

registerRoute('/form-demo', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('FormDemo', {}, app);
});

registerRoute('/icons', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  renderComponent('IconDemo', {}, app);
});

registerRoute('/icons/:key', (route) => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }

  const iconKey = route.state?.key ?? route.params.key;
  let src = ICON_SRC_MAP[iconKey];

  if (!src) {
    const uploads = getState('userIcons') || [];
    const found = uploads.find(item => item.key === iconKey);
    src = found?.src || null;
  }

  if (!src) {
    app.innerHTML = '<h2>Иконка не найдена</h2>';
    return;
  }

  const clicks = (getState('iconClicks') || {})[iconKey] || 0;
  renderComponent('IconDetail', { key: iconKey, src, clicks }, app);
});

// ----------------- НОВЫЕ ДЕМО (заглушки) -----------------

// registerRoute('/chat', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && typeof currentComponent.unmount === 'function') {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   currentComponent = bindComponentToStateWithDeps('Chat', {}, app);
// });

registerRoute('/chat', () => {
  const app = document.getElementById('app');
  if (currentComponent && currentComponent.unmount) { currentComponent.unmount(); currentComponent = null; }
  currentComponent = bindComponentToStateWithDeps('Chat', {}, app);
});

registerRoute('/file-progress', () => {
  const app = document.getElementById('app');
  if (currentComponent && currentComponent.unmount) {
    currentComponent.unmount();
    currentComponent = null;
  }
  currentComponent = bindComponentToStateWithDeps('FileProgressDemo', {}, app);
});

// Новые маршруты
registerRoute('/weather', () => {
  const app = document.getElementById('app');
  if (currentComponent && currentComponent.unmount) {
    currentComponent.unmount();
    currentComponent = null;
  }
  // Создаем контейнер для виджета погоды
  app.innerHTML = '<div id="weather-widget"></div>';
  initWeatherWidget();
});

// Personal Dashboard route
registerRoute('/dashboard', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  // Grid layout for dashboard
  app.innerHTML = `
    
    <section class="dashboard-checklist">
      <h3>✅ Framework Modules in Action</h3>
      <ul class="dashboard-modules-list">
        <li><b>This dashboard is a showcase of the full potential of the framework. All core modules are used together in a real-world scenario.</b></li>
        <li>🧩 <b>Components:</b> All widgets (Task Manager, Weather, Chat, Timer) are reusable components.</li>
        <li>🗂️ <b>State:</b> All data (tasks, weather, chat, timer) is managed via global state.</li>
        <li>💾 <b>PersistentState:</b> Your data is saved and restored automatically between sessions.</li>
        <li>🧭 <b>Router:</b> Navigation between Dashboard, Task Manager, and other pages.</li>
        <li>🌐 <b>API:</b> Weather widget fetches data from an external weather service.</li>
        <li>🖼️ <b>DOM:</b> Dynamic creation and update of UI elements in all widgets.</li>
        <li>⚡ <b>Events:</b> Event delegation for buttons and actions in Task Manager and Chat.</li>
        <li>📝 <b>Logger:</b> Errors and important actions are logged for debugging.</li>
        <li>⚙️ <b>Config:</b> Centralized configuration for API endpoints and app settings.</li>
        <li>🛠️ <b>Utils:</b> Advanced HTTP requests, caching, and helpers in widgets.</li>
      </ul>
    </section>
    <h1 class="dashboard-title">🏋️‍♂️ Fitness/Wellness Dashboard</h1>
    <div id="dashboard-layout" class="dashboard-grid">
      <section class="dashboard-zone dashboard-tasks">
        <h2><span class="dashboard-icon">📋</span> Task Manager</h2>
        <div class="dashboard-desc">Plan your daily or weekly exercises and track your fitness goals.</div>
        <div id="tasks-panel"></div>
      </section>
      <section class="dashboard-zone dashboard-weather">
        <h2><span class="dashboard-icon">☀️</span> Weather</h2>
        <div class="dashboard-desc">Check the weather to plan your outdoor workouts.</div>
        <div id="weather-panel"></div>
      </section>
      <section class="dashboard-zone dashboard-chat">
        <h2><span class="dashboard-icon">💬</span> Notes & Progress</h2>
        <div class="dashboard-desc"> Self-Check-In Chat or Daily Reflection Notes. Log your feelings, progress, motivation, and reminders.</div>
        <div id="chat-panel"></div>
      </section>
      <section class="dashboard-zone dashboard-timer">
        <h2><span class="dashboard-icon">⏱️</span> Time Tracker</h2>
        <div class="dashboard-desc">Interval timer for workouts and tracking exercise sets.</div>
        <div id="timetracker-panel"></div>
      </section>
    </div>
  `;
  // Weather
  const weatherPanel = document.getElementById('weather-panel');
  weatherPanel.innerHTML = '<div id="weather-widget"></div>';
  initWeatherWidget();
  // Tasks
  const tasksPanel = document.getElementById('tasks-panel');
  bindComponentToStateWithDeps('TaskManager', {}, tasksPanel);
  // Chat
  const chatPanel = document.getElementById('chat-panel');
  bindComponentToStateWithDeps('Chat', {}, chatPanel);
  // Time Tracker
  const timePanel = document.getElementById('timetracker-panel');
  bindComponentToStateWithDeps('TimeTracker', {}, timePanel);
});

// registerRoute('/theme-switcher', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('ThemeSwitcher', {}, app);
// });

// registerRoute('/heavy-component /lazy-demo', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('HeavyComponent Lazy-loading', {}, app);
// });

// registerRoute('/offline-demo', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('OfflineDemo', {}, app);
// });

// registerRoute('/undo-redo', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('UndoRedoDemo', {}, app);
// });

// registerRoute('/validated-form', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('ValidatedForm', {}, app);
// });

// registerRoute('/i18n-demo', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('I18nDemo', {}, app);
// });

// registerRoute('/plugin-calendar', () => {
//   const app = document.getElementById('app');
//   if (currentComponent && currentComponent.unmount) {
//     currentComponent.unmount();
//     currentComponent = null;
//   }
//   renderComponent('Calendar', {}, app);
// });



// ----------------------------------------------------------

registerNotFound(() => {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Страница не найдена</h2>';
});

window.navigateTo = function(path, event) {
  if (event) event.preventDefault();

  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }

  const app = document.getElementById('app');
  app.innerHTML = '';
  history.pushState({}, '', path);
  navigateTo(path);
};

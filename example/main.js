import { Router, registerRoute, registerNotFound, navigateTo } from 'framework/router.js';
import { initPersistentState } from 'framework/persistentState.js';
import { renderComponent, defineComponent, bindComponentToStateWithDeps } from 'framework/components.js';
import { registerHooks } from 'framework/router.js';
import { getState, setState } from 'framework/state.js';
import { IconDemo } from './components/IconDemo.js';

import { TimeTracker } from './components/timeTracker.js';
import { QueueManager } from './components/queueManager.js';
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
import { initImageGallery } from './components/ImageGallery.js';

//WORK

// import { ThemeSwitcher } from './components/extra/ThemeSwitcher.js';
// import { HeavyComponent } from './components/extra/HeavyComponent.js';
// import { OfflineDemo } from './components/extra/OfflineDemo.js';
// import { UndoRedoDemo } from './components/extra/UndoRedoDemo.js';
// import { ValidatedForm } from './components/extra/ValidatedForm.js';
// import { I18nDemo } from './components/extra/I18nDemo.js';
// import { Calendar } from 'framework/plugins/calendar.js'; // если плагин оттуда

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
defineComponent('QueueManager', QueueManager);
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

registerRoute('/queue', () => {
  const app = document.getElementById('app');
  if (currentComponent && typeof currentComponent.unmount === 'function') {
    currentComponent.unmount();
    currentComponent = null;
  }
  currentComponent = bindComponentToStateWithDeps('QueueManager', {}, app);
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

registerRoute('/gallery', () => {
  const app = document.getElementById('app');
  if (currentComponent && currentComponent.unmount) {
    currentComponent.unmount();
    currentComponent = null;
  }
  initImageGallery();
  currentComponent = bindComponentToStateWithDeps('image-gallery', {}, app);
});

registerRoute('/gallery/:id', (route) => {
  const app = document.getElementById('app');
  if (currentComponent && currentComponent.unmount) {
    currentComponent.unmount();
    currentComponent = null;
  }
  initImageGallery();
  const imageId = parseInt(route.params.id);
  import('./components/ImageGallery.js').then(({ selectImage }) => {
    selectImage(imageId);
    currentComponent = bindComponentToStateWithDeps('image-gallery', {}, app);
  });
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

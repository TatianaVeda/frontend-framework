export const Config = {
    api: {
      baseUrl: 'http://localhost:3000',
      defaultHeaders: {
        'Content-Type': 'application/json'
      },
      retryCount: 3,
      cacheDuration: 60000
    },
  
    websocket: {
      apiUrl: 'http://localhost:3000',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    },
  
    rest: {
      apiUrl: 'http://localhost:3000'
    },
  
    router: {
      basePath: '',
     
      defaultNotFoundHandler: () => {
        console.error('Страница не найдена');
      
        window.navigateTo('/tasks', true);
      }
    },
  
    dom: {
      lazyRenderOptions: {
        rootMargin: '0px',
        threshold: 0.1
      }
    },
  
    components: {
      defaultLifecycle: {
        mount: () => {},
        update: () => {},
        unmount: () => {}
      },
      virtualList: {
        itemHeight: 50,
        containerHeight: 300,
        buffer: 5
      }
    },
  
    events: {
      defaultThrottleDelay: 100,
      eventBusDebug: false
    },
  
    debug: true,
  
     theme: {
    default: 'auto',                // 'light' | 'dark' | 'custom' | 'auto'
    available: ['light','dark','custom','auto'],
    autoDetect: true,               // включаем авто-режим
     vars: {
    light: {
      '--bg-color': '#ffffff',
      '--text-color': '#000000',
      '--btn-bg':   '#eeeeee',
      '--btn-text': '#000000'
    },
    dark: {
      '--bg-color': '#1e1e1e',
      '--text-color': '#f0f0f0',
      '--btn-bg':   '#333333',
      '--btn-text': '#ffffff'
    },
    custom: { /* заполняется из state.customTheme */ }
  }
},
  
    offline: {
      serviceWorker: '/sw.js',
      cacheName: 'app-static-v1'
    },
  
    plugins: {},
  
    i18n: {
      defaultLocale: 'ru',
      available: ['ru', 'en'],
      translationsPath: '/i18n/'
    }
  };
  
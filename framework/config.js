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
      // basePath: '/framework',
      defaultNotFoundHandler: () => {
        console.error('Page not found');
        //window.navigateTo('/', true);
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
      default: 'light',
      available: ['light', 'dark']
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
  
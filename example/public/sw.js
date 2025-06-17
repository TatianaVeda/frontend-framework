// // public/sw.js

// const CACHE_NAME = 'dot-js-static-v1';
// const URLS_TO_CACHE = [
//   '/',            // example/index.html
//   '/styles.css',  // example/styles.css
//   '/main.js',     // example/main.js
//   '/favicon.ico',
//   '/apple-touch-icon.png',
//   '/android-chrome-192x192.png',
//   '/android-chrome-512x512.png',
//   '/favicon-16x16.png',
//   '/favicon-32x32.png',
//   '/site.webmanifest',
//   '/sw.js'
// ];

// // Установка: закешировать нужные файлы
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => cache.addAll(URLS_TO_CACHE))
//       .then(() => self.skipWaiting())
//   );
// });

// // Активация: почистить старые кэши
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(keys =>
//       Promise.all(
//         keys
//           .filter(key => key !== CACHE_NAME)
//           .map(key => caches.delete(key))
//       )
//     ).then(() => self.clients.claim())
//   );
// });

// // Fetch: отдать из кэша, а если нет — запросить из сети и закешировать
// self.addEventListener('fetch', event => {
//   // Только для GET-запросов к тому же origin
//   if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) {
//     return;
//   }
//   event.respondWith(
//     caches.match(event.request).then(cachedResponse => {
//       if (cachedResponse) {
//         // Вернем закешированное сразу
//         return cachedResponse;
//       }
//       // Иначе запросим из сети и закешируем копию
//       return fetch(event.request).then(networkResponse => {
//         // Защита от некорректных ответов
//         if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
//           return networkResponse;
//         }
//         const clone = networkResponse.clone();
//         caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
//         return networkResponse;
//       });
//     })
//   );
// });

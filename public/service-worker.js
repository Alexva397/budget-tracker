const STATIC_CACHE_NAME = "static-cache-v2";
const DATE_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
];

self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
    );
    evt.waitUntil(
      caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
  });
  

self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });



self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });
const urlsToCache = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/data/restaurants.json',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open('restaurantReviewCache').then(cache => {
    return cache.addAll(urlsToCache);
  }))
})

// Take control of the page as soon as the SW activates.
self.addEventListener('activate', event => {
  clients.claim();
  console.log("handling fetch events");
})

//The following snippet to go to the cache first
//was taken from https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
self.addEventListener('fetch', event => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method != 'GET') {
    return;
  }

  // Prevent the default, and handle the request ourselves.
  event.respondWith(async function() {
    // Try to get the response from a cache.
    const cache = await caches.open('restaurantReviewCache');
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      // If we found a match in the cache, return it, but also
      // update the entry in the cache in the background.
      fetch(event.request).then(response => {
        if (response.type != "opaque") {
          cache.put(event.request.url, response);
        }  
      });
      return cachedResponse;
    }

    // If we didn't find a match in the cache, use the network.
    // Also add it to the cache.
    return fetch(event.request).then(response => {
      if (response.type != "opaque") {
        cache.put(event.request.url, response.clone());
      }
      return response;
    });
  }());
});

let restaurant;
var newMap;
let review;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap2();
  DBHelper.submitReview();
  DBHelper.IdbToServer(getParameterByName('id'));
});

/**
 * Initialize leaflet map
 */
initMap2 = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [
          restaurant.latlng.lat, restaurant.latlng.lng
        ],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoidmk1dGFyIiwiYSI6ImNqaWt0OTc3MDFlbGczcHBmb3I2MHZ1M3QifQ.l87jrioq9ldfQiBMHpKX6w',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}
/*window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}*/

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchreviewById(id, (error, review) => {
        self.review = review;
        if (!review) {
          console.error(error);
          return;
        }
        fillReviewsHTML();
      });
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favToggle = document.getElementById('favToggle');
  favToggle.addEventListener('click', function() {
    const favStatus = DBHelper.toggleFavorite(restaurant.is_favorite, restaurant.id);
    favToggle.innerHTML = `Favorite: ${favStatus}`;
    restaurant.is_favorite = favStatus;
  })
  favToggle.innerHTML = `Favorite: ${restaurant.is_favorite}`

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  image.alt = restaurant.name + ' located at ' + restaurant.address;
  image.setAttribute('tabindex', 0);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute('tabindex', 0);
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.review) => {
  //console.log(reviews);
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  const addReview = document.createElement('button');
  addReview.id='review-button';
  addReview.innerHTML = 'Submit Review';
  addReview.addEventListener('click', openModal);
  container.appendChild(addReview);

  /*const testButton = document.createElement('button');
  testButton.id='test-button';
  testButton.innerHTML = 'Test';
  testButton.addEventListener('click', DBHelper.testIdbToServer);
  container.appendChild(testButton);*/

  /*const testCacheButton = document.createElement('button');
  testCacheButton.id='test-cache-button';
  testCacheButton.innerHTML = 'Test Cache';
  testCacheButton.addEventListener('click', DBHelper.testCacheRetrieve);
  container.appendChild(testCacheButton);*/

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');

  li.setAttribute('tabindex', 0);

  name.innerHTML = review.name;
  li.appendChild(name);

  //const date = document.createElement('p');
  //date.innerHTML = review.date;
  //li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//Opens the modal
openModal = () => {
  let modal = document.getElementById('my-modal');
  let hiddenInput = document.getElementById('resIdForForm');
  hiddenInput.setAttribute('value', self.restaurant.id);
  modal.style.display = 'block';
}

//Closes the modal when the 'x' is clicked
closeModal = () => {
  let modal = document.getElementById('my-modal');
  modal.style.display = 'none';
}

//closes the modal when user clicks outside of the modal
window.onclick = (event) => {
  let modal = document.getElementById('my-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  static fetchreviewById(id, callback) {
    let review = fetch('http://localhost:1337/reviews/?restaurant_id=' + id)
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        //console.log(myJson);
        return callback(null, myJson);
      });

  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([
      restaurant.latlng.lat, restaurant.latlng.lng
    ], {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    })
    marker.addTo(newMap);
    return marker;
  }
  /*static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }*/

  //toggle Favorite status and update the server
  static toggleFavorite(status, id) {
    const updateFavUrl = 'http://localhost:1337/restaurants/' + id + '/?is_favorite=';
    if (status == true | status == "true" | status == undefined) {
      status = false;
      fetch(updateFavUrl + status, {method: 'PUT'})
      .then(update => {fetch('http://localhost:1337/restaurants');})
      .catch(fetchFail => {
        idbKeyval.set('restaurant_id=' + id, {
          method: 'PUT',
          url: updateFavUrl + status
        })
        .then(() => {
          caches.open('restaurantReviewCache')
            .then(cache => {
              return cache.match('http://localhost:1337/restaurants')
            })
            .then(response => {
              return response.json();
            })
            .then(data => {
              //console.log(data);
              for(let num of data) {
                if(num.id == id) {
                  num.is_favorite = status;
                }
              }
              let responseToCache = new Response(JSON.stringify(data));
              caches.open('restaurantReviewCache').then(cache => {cache.put('http://localhost:1337/restaurants', responseToCache)});
            });
        })
      });
    } else if (status == false | status == "false") {
      status = true;
      fetch(updateFavUrl + status, {method: 'PUT'})
      .then(update => {fetch('http://localhost:1337/restaurants');})
      .catch(fetchFail => {
        idbKeyval.set('restaurant_id=' + id, {
          method: 'PUT',
          url: updateFavUrl + status
        })
        .then(() => {
          caches.open('restaurantReviewCache')
            .then(cache => {
              return cache.match('http://localhost:1337/restaurants')
            })
            .then(response => {
              return response.json();
            })
            .then(data => {
              //console.log(data);
              for(let num of data) {
                if(num.id == id) {
                  num.is_favorite = status;
                }
              }
              let responseToCache = new Response(JSON.stringify(data));
              caches.open('restaurantReviewCache').then(cache => {cache.put('http://localhost:1337/restaurants', responseToCache)});
            });
        })
      });
    }
    return status;
  }

  //handles submitting a review and refreshing the page after server has been
  //updated.
  static submitReview() {
    document.getElementById("my-form").addEventListener("submit", function(event) {
      event.preventDefault();

      //get review values from form
      const id = document.getElementById("resIdForForm").value;
      const name = document.getElementById("form-name").value;
      const rating = document.getElementById("form-rating").value;
      const comments = document.getElementById("form-comments").value;
      const reviewsByIdUrl = 'http://localhost:1337/reviews/?restaurant_id=' + id;
      const submitReviewUrl = 'http://localhost:1337/reviews/';
      const review = {"restaurant_id": id, "name": name, "rating": rating, "comments": comments};

      //submit review to server and reload page
      fetch(submitReviewUrl, {
        method: 'POST',
        body: JSON.stringify(review)
      })
      .then(update => {
        fetch(reviewsByIdUrl)
        .then(reload => {
          window.location.reload()
        })
      })
      //if unable to submit review to server store it in idb for later
      //submission, upadte cache, and reload page.
      .catch(fetchFail => {
        idbKeyval.set(Date.now(), {
          method: 'POST',
          body: JSON.stringify(review)
        })
          .then(() => {
            caches.open('restaurantReviewCache')
              .then(cache => {
                return cache.match(reviewsByIdUrl)
              })
              .then(response => {
                return response.json();
              })
              .then(data => {
                data.push(review);
                let responseToCache = new Response(JSON.stringify(data));
                caches.open('restaurantReviewCache').then(cache => {cache.put(reviewsByIdUrl, responseToCache)});
              });
          })
          .catch(err => console.log('It failed!', err))
          .then(() => window.location.reload())
      })
    })
  }


  //takes reviews stored in indexDB and writes them to server
  static IdbToServer(id) {
    idbKeyval.keys().then(keys => {
      return keys[0];
    }).then(cached => {
        idbKeyval.get(cached)
        .then(result => {
          if (result.method == 'POST') {
            fetch('http://localhost:1337/reviews/', result).then(() => idbKeyval.del(cached)).then(() => DBHelper.IdbToServer());
          } else {
            console.log(result);
            fetch(result.url, {method: result.method}).then(() => idbKeyval.del(cached)).then(() => DBHelper.IdbToServer());
          }

        })
        .catch(err => {
          console.log('no pairs');
          if (id) {
            fetch('http://localhost:1337/reviews/?restaurant_id=' + id).then(() => console.log('updated cache'))
            .then(() => fetch('http://localhost:1337/restaurants'));
          }
          fetch('http://localhost:1337/restaurants');
        })
    })
  }

  //takes a review and adds it to the cache
  static async testCacheRetrieve(id) {
    const testReview = {"restaurant_id": "2", "name": "McToad", "rating": "2", "comments": "this place sucks"}
    const key = 'http://localhost:1337/reviews/?restaurant_id=' + id;
    //const cache = await caches.open('restaurantReviewCache');
    //const cachedResponse = await cache.match(key);
    caches.open('restaurantReviewCache')
      .then(cache => {
        return cache.match(key)
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        data.push(testReview);
        let testResponse = new Response(JSON.stringify(data));
        caches.open('restaurantReviewCache').then(cache => {cache.put(key, testResponse)});
      });
    //fetch(key).then(result => {console.log(result)});
    //console.log(cachedResponse.body);
    //console.log('wacka wacka');
  }

}

var idbKeyval = (function (exports) {
'use strict';

class Store {
    constructor(dbName = 'keyval-store', storeName = 'keyval') {
        this.storeName = storeName;
        this._dbp = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(dbName, 1);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => resolve(openreq.result);
            // First time setup: create an empty object store
            openreq.onupgradeneeded = () => {
                openreq.result.createObjectStore(storeName);
            };
        });
    }
    _withIDBStore(type, callback) {
        return this._dbp.then(db => new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, type);
            transaction.oncomplete = () => resolve();
            transaction.onabort = transaction.onerror = () => reject(transaction.error);
            callback(transaction.objectStore(this.storeName));
        }));
    }
}
let store;
function getDefaultStore() {
    if (!store)
        store = new Store();
    return store;
}
function get(key, store = getDefaultStore()) {
    let req;
    return store._withIDBStore('readonly', store => {
        req = store.get(key);
    }).then(() => req.result);
}
function set(key, value, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.put(value, key);
    });
}
function del(key, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.delete(key);
    });
}
function clear(store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.clear();
    });
}
function keys(store = getDefaultStore()) {
    const keys = [];
    return store._withIDBStore('readonly', store => {
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // And openKeyCursor isn't supported by Safari.
        (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
            if (!this.result)
                return;
            keys.push(this.result.key);
            this.result.continue();
        };
    }).then(() => keys);
}

exports.Store = Store;
exports.get = get;
exports.set = set;
exports.del = del;
exports.clear = clear;
exports.keys = keys;

return exports;

}({}));

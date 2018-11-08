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

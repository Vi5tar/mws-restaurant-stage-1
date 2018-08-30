let restaurant;var newMap;document.addEventListener("DOMContentLoaded",e=>{initMap2()}),initMap2=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.newMap=L.map("map",{center:[t.latlng.lat,t.latlng.lng],zoom:16,scrollWheelZoom:!1}),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1Ijoidmk1dGFyIiwiYSI6ImNqaWt0OTc3MDFlbGczcHBmb3I2MHZ1M3QifQ.l87jrioq9ldfQiBMHpKX6w",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.newMap))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=DBHelper.imageUrlForRestaurant(e)+".jpg",t.alt=e.name+" located at "+e.address,t.setAttribute("tabindex",0),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");t.setAttribute("tabindex",0);for(let n in e){const a=document.createElement("tr"),r=document.createElement("td");r.innerHTML=n,a.appendChild(r);const l=document.createElement("td");l.innerHTML=e[n],a.appendChild(l),t.appendChild(a)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const a=document.getElementById("reviews-list");e.forEach(e=>{a.appendChild(createReviewHTML(e))}),t.appendChild(a)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");t.setAttribute("tabindex",0),n.innerHTML=e.name,t.appendChild(n);const a=document.createElement("p");a.innerHTML=e.date,t.appendChild(a);const r=document.createElement("p");r.innerHTML=`Rating: ${e.rating}`,t.appendChild(r);const l=document.createElement("p");return l.innerHTML=e.comments,t.appendChild(l),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null});class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){let t=new XMLHttpRequest;t.open("GET",DBHelper.DATABASE_URL),t.onload=(()=>{if(200===t.status){const n=JSON.parse(t.responseText);e(null,n)}else{const n=`Request failed. Returned status of ${t.status}`;e(n,null)}}),t.send()}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((a,r)=>{if(a)n(a,null);else{let a=r;"all"!=e&&(a=a.filter(t=>t.cuisine_type==e)),"all"!=t&&(a=a.filter(e=>e.neighborhood==t)),n(null,a)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),a=t.filter((e,n)=>t.indexOf(e)==n);e(null,a)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),a=t.filter((e,n)=>t.indexOf(e)==n);e(null,a)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph}`}static mapMarkerForRestaurant(e,t){const n=new L.marker([e.latlng.lat,e.latlng.lng],{title:e.name,alt:e.name,url:DBHelper.urlForRestaurant(e)});return n.addTo(newMap),n}}
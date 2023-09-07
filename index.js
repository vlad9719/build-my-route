const MINUTES_IN_HOUR = 60;
const KILOMETERS_IN_DEGREE = 111;

const form = document.getElementById("coordinates");
form.addEventListener("submit", calculateRoute);

const button = document.getElementById("set-current-location");
button.addEventListener("click", setCurrentLocation);

function calculateRoute(event) {
  loadMapWithRoute();
  event.preventDefault();
}

function setCurrentLocation() {
  navigator.geolocation.getCurrentPosition(setCurrentPosition)
}

function loadMapWithRoute() {
  const mapUrl = generateRouteMapUrl();
  changeMapIframeUrl(mapUrl);
}

function generateRouteMapUrl() {
  const routeCoords = getRouteCoords();
  return getMapUrl(routeCoords);
}

function changeMapIframeUrl(mapUrl) {
  const mapIframe = document.getElementById("map");
  mapIframe.src = mapUrl;
}

function setCurrentPosition(position) {
  setStartLongitude(position);
  setStartLatitude(position);
}

function getCenterLongitude(routeCoords) {
  const longitudes = routeCoords.map(coord => coord.longitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  return getAverageOfTwo(minLongitude, maxLongitude);
}

function getCenterLatitude(routeCoords) {
  const latitudes = routeCoords.map(coord => coord.latitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  return getAverageOfTwo(minLatitude, maxLatitude);
}

function getAverageOfTwo(first, second) {
  return (parseInt(first) + parseInt(second)) / 2;
}

function getRouteCoords() {
  const startLongitude = getStartLongitude();
  const startLatitude = getStartLatitude();
  const midPointLongitude = getMidPointLongitude();
  const midPointLatitude = getMidPointLatitude();
  const finishLongitude = getStartLongitude();
  const finishLatitude = getStartLatitude();
  const routeCoords = [{ latitude: startLatitude, longitude: startLongitude }, { latitude: midPointLatitude, longitude: midPointLongitude }, { latitude: finishLatitude, longitude: finishLongitude }];
  return routeCoords;
}

function getMapUrl(routeCoords) {
  return `https://routing.openstreetmap.de/?z=15&center=${getCenterLongitude(routeCoords)}%2C${getCenterLatitude(routeCoords)}${routeCoords.map(coord => `&loc=${coord.latitude}%2C${coord.longitude}`)}&hl=en&alt=0&srv=2&amp;layer=mapnik`;
}

function getStartLongitude() {
  const startLongitudeInput = getStartLongitudeInput();
  return startLongitudeInput.value;
}

function getStartLatitude() {
  const startLatitudeInput = getStartLatitudeInput();
  return startLatitudeInput.value;
}

function getMidPointLongitude() {
  return getStartLongitude();
}

function getMidPointLatitude() {
  const startLatitude = parseFloat(getStartLatitude());
  const latitudeDelta = getLatitudeDelta();
  return (startLatitude + latitudeDelta).toString();
}

function setStartLongitude(position) {
  const startLongitudeInput = getStartLongitudeInput();
  startLongitudeInput.value = position.coords.longitude;
}

function setStartLatitude(position) {
  const startLatitudeInput = getStartLatitudeInput();
  startLatitudeInput.value = position.coords.latitude;
}

function getStartLongitudeInput() {
  return document.getElementById("start-longitude");
}

function getStartLatitudeInput() {
  return document.getElementById("start-latitude");
}

function getLatitudeDelta() {
  const duration = document.getElementById("duration").value;
  const speed = document.getElementById("speed").value;
  const distance = ((duration / 60) * speed) / 2;
  return distance / KILOMETERS_IN_DEGREE;
}

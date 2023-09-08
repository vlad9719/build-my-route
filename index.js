const KILOMETERS_IN_DEGREE = 111;

const strategies = [{
  name: "NORTH_AND_BACK",
  getRouteCoordinates: getGoNorthAndBackRouteCoords,
  isUsed: false
}, {
  name: "NORTH_AND_WEST_AND_SOUTH_AND_BACK",
  getRouteCoordinates: getGoNorthThenWestThenSouthThenEastCoords,
  isUsed: false
}];

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

function setCurrentPosition(position) {
  setStartLongitude(position);
  setStartLatitude(position);
}

function generateRouteMapUrl() {
  const routeCoords = getRouteCoords();
  return getMapUrl(routeCoords);
}

function changeMapIframeUrl(mapUrl) {
  const mapIframe = document.getElementById("map");
  mapIframe.src = mapUrl;
}

function setStartLongitude(position) {
  const startLongitudeInput = getStartLongitudeInput();
  startLongitudeInput.value = position.coords.longitude;
}

function setStartLatitude(position) {
  const startLatitudeInput = getStartLatitudeInput();
  startLatitudeInput.value = position.coords.latitude;
}

function getRouteCoords() {
  markAllStrategiesUnusedIfNeeded(strategies);
  let currentStrategyIndex = 0;
  while (currentStrategyIndex < strategies.length) {
    if (strategies[currentStrategyIndex].isUsed) {
      currentStrategyIndex++;
    } else {
      return getStrategyRouteCoordsByIndexAndMarkStrategyAsUsed(currentStrategyIndex);
    }
  }
}

function getMapUrl(routeCoords) {
  return `https://routing.openstreetmap.de/?z=15&center=${getCenterLongitude(routeCoords)}%2C${getCenterLatitude(routeCoords)}${routeCoords.map(coord => `&loc=${coord.latitude}%2C${coord.longitude}`)}&hl=en&alt=0&srv=2&amp;layer=mapnik`;
}

function getStartLongitudeInput() {
  return document.getElementById("start-longitude");
}

function getStartLatitudeInput() {
  return document.getElementById("start-latitude");
}

function markAllStrategiesUnusedIfNeeded(strategies) {
  if (isAllStrategiesUsed(strategies)) {
    markAllStrategiesUnused(strategies);
  }
}

function getStrategyRouteCoordsByIndexAndMarkStrategyAsUsed(strategyIndex) {
  const routeCoords = strategies[strategyIndex].getRouteCoordinates({ latitude: getStartLatitude(), longitude: getStartLongitude() });
  strategies[strategyIndex].isUsed = true;
  return routeCoords;
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

function isAllStrategiesUsed(strategies) {
  return strategies.every(strategy => strategy.isUsed);
}

function markAllStrategiesUnused(strategies) {
  strategies = strategies.map(strategy => strategy.isUsed = false);
}

function getStartLatitude() {
  const startLatitudeInput = getStartLatitudeInput();
  return startLatitudeInput.value;
}

function getStartLongitude() {
  const startLongitudeInput = getStartLongitudeInput();
  return startLongitudeInput.value;
}

function getAverageOfTwo(first, second) {
  return (parseInt(first) + parseInt(second)) / 2;
}

// route strategies

// Strategy #1: Go North and back
function getGoNorthAndBackRouteCoords(startCoords) {
  const northPointLongitude = startCoords.longitude;
  const northPointLatitude = getForwardAndBackRouteNorthPointLatitude(startCoords.latitude);
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: northPointLatitude, longitude: northPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy #2: Go North, then West, then South, then back
function getGoNorthThenWestThenSouthThenEastCoords(startCoords) {
  const northEastPointLongitude = startCoords.longitude;
  const northEastPointLatitude = getCircleRouteNorthPointLatitude(startCoords.latitude);
  const northWestPointLongitude = getCircleRouteWestPointLongitude(startCoords.longitude);
  const northWestPointLatitude = northEastPointLatitude;
  const southWestPointLongitude = northWestPointLongitude;
  const southWestPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: northEastPointLatitude, longitude: northEastPointLongitude }, { latitude: northWestPointLatitude, longitude: northWestPointLongitude }, { latitude: southWestPointLatitude, longitude: southWestPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

function getForwardAndBackRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getCircleRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getCircleRouteWestPointLongitude(startLongitude) {
  const longitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) - longitudeDelta).toString();
}

function getForwardAndBackRouteLatitudeOrLongitudeDelta() {
  const duration = getDurationValue();
  const speed = getSpeedValue();
  const distance = ((duration / 60) * speed) / 2;
  return distance / KILOMETERS_IN_DEGREE;
}

function getCircleRouteLatitudeOrLongitudeDelta() {
  const duration = getDurationValue();
  const speed = getSpeedValue();
  const distance = ((duration / 60) * speed) / 4;
  return distance / KILOMETERS_IN_DEGREE;
}

function getDurationValue() {
  return document.getElementById("duration").value;
}

function getSpeedValue() {
  return document.getElementById("speed").value;
}
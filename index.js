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
  const startLongitude = startCoords.longitude;
  const startLatitude = startCoords.latitude;
  const northPointLongitude = startLongitude;
  const northPointLatitude = getForwardAndBackRouteNorthPointLatitude(startLatitude);
  const finishLongitude = startCoords.longitude;
  const finishLatitude = startCoords.latitude;
  const routeCoords = [{ latitude: startLatitude, longitude: startLongitude }, { latitude: northPointLatitude, longitude: northPointLongitude }, { latitude: finishLatitude, longitude: finishLongitude }];
  return routeCoords;
}

// Strategy #2: Go North, then West, then South, then back
function getGoNorthThenWestThenSouthThenEastCoords(startCoords) {
  const startLongitude = startCoords.longitude;
  const startLatitude = startCoords.latitude;
  const northPointLongitude = startLongitude;
  const northPointLatitude = getCircleRouteNorthPointLatitude(startLatitude);
  const westPointLongitude = getCircleRouteWestPointLongitude(startLongitude);
  const westPointLatitude = northPointLatitude;
  const eastPointLongitude = westPointLongitude;
  const eastPointLatitude = startLatitude;
  const finishLongitude = startCoords.longitude;
  const finishLatitude = startCoords.latitude;
  const routeCoords = [{ latitude: startLatitude, longitude: startLongitude }, { latitude: northPointLatitude, longitude: northPointLongitude }, { latitude: westPointLatitude, longitude: westPointLongitude }, { latitude: eastPointLatitude, longitude: eastPointLongitude }, { latitude: finishLatitude, longitude: finishLongitude }];
  return routeCoords;
}

function getForwardAndBackRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getForwardAndBackRouteLatitudeOrLongitudeDelta() {
  const duration = document.getElementById("duration").value;
  const speed = document.getElementById("speed").value;
  const distance = ((duration / 60) * speed) / 2;
  return distance / KILOMETERS_IN_DEGREE;
}

function getCircleRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getCircleRouteWestPointLongitude(startLongitude) {
  const longitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) - longitudeDelta).toString();
}

function getCircleRouteLatitudeOrLongitudeDelta() {
  const duration = document.getElementById("duration").value;
  const speed = document.getElementById("speed").value;
  const distance = ((duration / 60) * speed) / 4;
  return distance / KILOMETERS_IN_DEGREE;
}

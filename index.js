const KILOMETERS_IN_DEGREE = 111;

const strategies = [{
  name: "NORTH_AND_BACK",
  getRouteCoordinates: getGoNorthAndBackRouteCoords,
  isUsed: false
}, {
  name: "SOUTH_AND_BACK",
  getRouteCoordinates: getGoSouthAndBackRouteCoords,
  isUsed: false
}, {
  name: "EAST_AND_BACK",
  getRouteCoordinates: getGoEastAndBackRouteCoords,
  isUsed: false
}, {
  name: "WEST_AND_BACK",
  getRouteCoordinates: getGoWestAndBackRouteCoords,
  isUsed: false
}, {
  name: "NORTH_AND_WEST_AND_SOUTH_AND_BACK",
  getRouteCoordinates: getGoNorthThenWestThenSouthThenEastCoords,
  isUsed: false
}, {
  name: "NORTH_AND_EAST_AND_SOUTH_AND_BACK",
  getRouteCoordinates: getGoNorthThenEastThenSouthThenWestCoords,
  isUsed: false
}, {
  name: "SOUTH_AND_EAST_AND_NORTH_AND_BACK",
  getRouteCoordinates: getGoSouthThenEastThenNorthThenWestCoords,
  isUsed: false
}, {
  name: "SOUTH_AND_WEST_AND_NORTH_AND_BACK",
  getRouteCoordinates: getGoSouthThenWestThenNorthThenEastCoords,
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

// Strategy: Go North and Back
function getGoNorthAndBackRouteCoords(startCoords) {
  const northPointLongitude = startCoords.longitude;
  const northPointLatitude = getForwardAndBackRouteNorthPointLatitude(startCoords.latitude);
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: northPointLatitude, longitude: northPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go South and Back
function getGoSouthAndBackRouteCoords(startCoords) {
  const southPointLongitude = startCoords.longitude;
  const southPointLatitude = getForwardAndBackRouteSouthPointLatitude(startCoords.latitude);
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: southPointLatitude, longitude: southPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go East and Back
function getGoEastAndBackRouteCoords(startCoords) {
  const eastPointLongitude = getForwardAndBackRouteEastPointLongitude(startCoords.longitude);
  const eastPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: eastPointLatitude, longitude: eastPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go West and Back
function getGoWestAndBackRouteCoords(startCoords) {
  const westPointLongitude = getForwardAndBackRouteWestPointLongitude(startCoords.longitude);
  const westPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: westPointLatitude, longitude: westPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go North, then West, then South, then Back
function getGoNorthThenWestThenSouthThenEastCoords(startCoords) {
  const northEastPointLongitude = startCoords.longitude;
  const northEastPointLatitude = getCircleRouteNorthPointLatitude(startCoords.latitude);
  const northWestPointLongitude = getCircleRouteWestPointLongitude(startCoords.longitude);
  const northWestPointLatitude = northEastPointLatitude;
  const southWestPointLongitude = northWestPointLongitude;
  const southWestPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: northEastPointLatitude, longitude: northEastPointLongitude }, { latitude: northWestPointLatitude, longitude: northWestPointLongitude }, { latitude: southWestPointLatitude, longitude: southWestPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go North, then East, then South, then Back
function getGoNorthThenEastThenSouthThenWestCoords(startCoords) {
  const northWestPointLongitude = startCoords.longitude;
  const northWestPointLatitude = getCircleRouteNorthPointLatitude(startCoords.latitude);
  const northEastPointLongitude = getCircleRouteEastPointLongitude(startCoords.longitude);
  const northEastPointLatitude = northWestPointLatitude;
  const southEastPointLongitude = northEastPointLongitude;
  const southEastPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: northWestPointLatitude, longitude: northWestPointLongitude }, { latitude: northEastPointLatitude, longitude: northEastPointLongitude }, { latitude: southEastPointLatitude, longitude: southEastPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go South, then East, then North, then Back
function getGoSouthThenEastThenNorthThenWestCoords(startCoords) {
  const southWestPointLongitude = startCoords.longitude;
  const southWestPointLatitude = getCircleRouteSouthPointLatitude(startCoords.latitude);
  const southEastPointLongitude = getCircleRouteEastPointLongitude(startCoords.longitude);
  const southEastPointLatitude = southWestPointLatitude;
  const northEastPointLongitude = southEastPointLongitude;
  const northEastPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: southWestPointLatitude, longitude: southWestPointLongitude }, { latitude: southEastPointLatitude, longitude: southEastPointLongitude }, { latitude: northEastPointLatitude, longitude: northEastPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

// Strategy: Go South, then West, then North, then Back
function getGoSouthThenWestThenNorthThenEastCoords(startCoords) {
  const southEastPointLongitude = startCoords.longitude;
  const southEastPointLatitude = getCircleRouteSouthPointLatitude(startCoords.latitude);
  const southWestPointLongitude = getCircleRouteWestPointLongitude(startCoords.longitude);
  const southWestPointLatitude = southEastPointLatitude;
  const northWestPointLongitude = southWestPointLongitude;
  const northWestPointLatitude = startCoords.latitude;
  return [{ latitude: startCoords.latitude, longitude: startCoords.longitude }, { latitude: southEastPointLatitude, longitude: southEastPointLongitude }, { latitude: southWestPointLatitude, longitude: southWestPointLongitude }, { latitude: northWestPointLatitude, longitude: northWestPointLongitude }, { latitude: startCoords.latitude, longitude: startCoords.longitude }];
}

function getForwardAndBackRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getForwardAndBackRouteSouthPointLatitude(startLatitude) {
  const latitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) - latitudeDelta).toString();
}

function getForwardAndBackRouteEastPointLongitude(startLongitude) {
  const longitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) + longitudeDelta).toString();
}

function getForwardAndBackRouteWestPointLongitude(startLongitude) {
  const longitudeDelta = getForwardAndBackRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) - longitudeDelta).toString();
}

function getCircleRouteNorthPointLatitude(startLatitude) {
  const latitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) + latitudeDelta).toString();
}

function getCircleRouteWestPointLongitude(startLongitude) {
  const longitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) - longitudeDelta).toString();
}

function getCircleRouteEastPointLongitude(startLongitude) {
  const longitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLongitude) + longitudeDelta).toString();
}

function getCircleRouteSouthPointLatitude(startLatitude) {
  const latitudeDelta = getCircleRouteLatitudeOrLongitudeDelta();
  return (parseFloat(startLatitude) - latitudeDelta).toString();
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
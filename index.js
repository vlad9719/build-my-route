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
  const startLongitude = getStartLongitude();
  const startLatitude = getStartLatitude();
  const finishLongitude = getFinishLongitude();
  const finishLatitude = getFinishLatitude();
  const mapIframe = document.getElementById("map");
  const mapUrl = `https://routing.openstreetmap.de/?z=15&center=${getCenterLongitude(startLongitude, finishLongitude)}%2C${getCenterLatitude(startLatitude, finishLatitude)}&loc=${startLatitude}%2C${startLongitude}&loc=${finishLatitude}%2C${finishLongitude}&hl=en&alt=0&srv=2&amp;layer=mapnik`;
  mapIframe.src = mapUrl;
}

function setCurrentPosition(position) {
  setStartLongitude(position);
  setStartLatitude(position);
}

function getCenterLongitude(startLongitude, finishLongitude) {
  return getAverageOfTwo(startLongitude, finishLongitude);
}

function getCenterLatitude(startLatitude, finishLatitude) {
  return getAverageOfTwo(startLatitude, finishLatitude);
}

function getAverageOfTwo(first, second) {
  return (parseInt(first) + parseInt(second)) / 2;
}

function getStartLongitude() {
  const startLongitudeInput = getStartLongitudeInput();
  return startLongitudeInput.value;
}

function getStartLatitude() {
  const startLatitudeInput = getStartLatitudeInput();
  return startLatitudeInput.value;
}

function getFinishLongitude() {
  return getStartLongitude();
}

function getFinishLatitude() {
  const startLatitude = parseFloat(getStartLatitude());
  const latitudeDelta = getLatitudeDelta();
  return startLatitude + latitudeDelta;
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
  const distance = (duration / 60) * speed;
  return distance / KILOMETERS_IN_DEGREE;
}
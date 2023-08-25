const form = document.getElementById("coordinates");
form.addEventListener("submit", submitCoordinates);

const button = document.getElementById("set-current-location");
button.addEventListener("click", setCurrentLocation);

function submitCoordinates(event) {
  reloadMapWithNewCoordinates();
  event.preventDefault();
}

function setCurrentLocation() {
  navigator.geolocation.getCurrentPosition(setCurrentPosition)
}

function reloadMapWithNewCoordinates() {
  const mapIframe = document.getElementById("map");
  const startLongitude = getStartLongitude();
  const startLatitude = getStartLatitude();
  const finishLongitude = getFinishLongitude();
  const finishLatitude = getFinishLatitude();
  mapIframe.src = `https://routing.openstreetmap.de/?z=15&center=${getCenterLongitude(startLongitude, finishLongitude)}%2C${getCenterLatitude(startLatitude, finishLatitude)}&loc=${startLatitude}%2C${startLongitude}&loc=${finishLatitude}%2C${finishLongitude}&hl=en&alt=0&srv=2&amp;layer=mapnik`;
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
  const finishLongitudeInput = getFinishLongitudeInput();
  return finishLongitudeInput.value;
}

function getFinishLatitude() {
  const finishLatitudeInput = getFinishLatitudeInput();
  return finishLatitudeInput.value;
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

function getFinishLongitudeInput() {
  return document.getElementById("finish-longitude");
}

function getFinishLatitudeInput() {
  return document.getElementById("finish-latitude");
}
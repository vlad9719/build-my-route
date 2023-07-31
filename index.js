const form = document.getElementById("coordinates");
form.addEventListener("submit", submitCoordinates);

function submitCoordinates(event) {
  reloadMapWithNewCoordinates();
  event.preventDefault();
}

function reloadMapWithNewCoordinates() {
  const mapIframe = document.getElementById("map");
  const startLongitude = getStartLongitude();
  const startLatitude = getStartLatitude();
  const finishLongitude = getFinishLongitude();
  const finishLatitude = getFinishLatitude();
  mapIframe.src = `https://routing.openstreetmap.de/?z=15&center=${getCenterLongitude(startLongitude, finishLongitude)}%2C${getCenterLatitude(startLatitude, finishLatitude)}&loc=${startLatitude}%2C${startLongitude}&loc=${finishLatitude}%2C${finishLongitude}&hl=en&alt=0&srv=2&amp;layer=mapnik`;
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
  const startLongitudeInput = document.getElementById("start-longitude");
  return startLongitudeInput.value;
}

function getStartLatitude() {
  const startLatitudeInput = document.getElementById("start-latitude");
  return startLatitudeInput.value;
}

function getFinishLongitude() {
  const finishLongitudeInput = document.getElementById("finish-longitude");
  return finishLongitudeInput.value;
}

function getFinishLatitude() {
  const finishLatitudeInput = document.getElementById("finish-latitude");
  return finishLatitudeInput.value;
}

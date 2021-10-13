import { ValidateDay, ValidateWeek } from "./validate";
import "./style.css";

function getElement(selector) {
  return document.querySelector(selector);
}

const inputForm = getElement("form");
const inputElement = getElement("#distanceCover");
const alertTemplateElement = getElement("#alertTemplate");

function getElementValue(selector) {
  return selector.value;
}

function addEvent(element, type, handler) {
  element.addEventListener(type, handler);
}

function showAlert(text) {
  const alert = alertTemplateElement.content.firstElementChild.cloneNode(true);
  const closeAlertBtn = alert.children[1];
  alert.children[0].textContent = text;
  alert.classList.add("alert-show");
  document.body.append(alert);
  addEvent(closeAlertBtn, "click", hideAlert.bind(null, alert));
  setTimeout(() => {
    hideAlert(alert);
  }, 2000);
}

function hideAlert(selector) {
  selector.classList.remove("alert-show");
  selector.classList.add("alert-hide");
  setTimeout(() => {
    selector.remove();
  }, 300);
}

function formHandler(e) {
  const inputElementValue = getElementValue(inputElement);
  e.preventDefault();
  if (inputElementValue <= 0) {
    showAlert("Please enter a correct value.");
    return;
  }
  const distances = getDistances();
  if (distances) {
    const dateJSON = distances[distances.length - 1]["time"];
    if (ValidateDay(dateJSON)) {
      showAlert("You have set today's entry.");
      return;
    }
  }
  setDistances(inputElementValue);
  e.target.reset();
}

addEvent(inputForm, "submit", formHandler);

function getDistanceValues(array) {
  const newArray = array.map((distance) => distance["value"]);
  return newArray;
}

function getDistances() {
  let distances = JSON.parse(localStorage.getItem("distance")) || false;
  return distances;
}

function setDistances(value) {
  const distances = getDistances() || [];
  distances.push({ value, time: new Date() });
  localStorage.setItem("distance", JSON.stringify(distances));
  showDistances(createElementList(distances));
  const distanceValues = getDistanceValues(distances);
  analyticsHandler.analyticsCompute(distanceValues);
}

function createElementList(array) {
  const distanceListItems = document.querySelectorAll(".distance-list-item");
  const distanceListElements = [];
  for (let i = 0; i < distanceListItems.length; i++) {
    if (!array[i]) {
      distanceListElements.unshift(`<li class="distance-list-item">-</li>`);
    } else {
      distanceListElements.unshift(
        `<li class="distance-list-item">${array[i]["value"]}</li>`
      );
    }
  }
  return distanceListElements;
}

function showDistances(elementsArray) {
  const list = getElement(".distance-list");
  list.innerHTML = elementsArray.join("");
}

class Analytics {
  constructor() {
    this.totalElement = getElement("#totalDistance");
    this.averageElement = getElement("#averageDistance");
    this.weekendHighElement = getElement("#weekendHigh");
    this.circle = getElement(".progress-circle");
    this.circleRadius = this.circle.r.baseVal.value;
    this.progressElement = getElement("#progressValue");
    this.acheivedValueElement = getElement("#acheivedValue");
  }

  analyticsCompute = (array) => {
    const total = array.reduce((all, crr) => all + parseFloat(crr), 0);
    const average = total / array.length;
    const weekendHigh = Math.max(...array);
    this.totalElement.textContent = total.toFixed(1);
    this.acheivedValueElement.textContent = total.toFixed(1);
    this.averageElement.textContent = average.toFixed(2);
    this.weekendHighElement.textContent = weekendHigh;
    const percent = (total / 25) * 100;
    this.progressElement.textContent = percent.toFixed(1);
    setProgress(percent, this.circleRadius, this.circle);
  };
}

function setProgress(percent, radius, elem) {
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  elem.style.strokeDashoffset = parseInt(offset);
}

const analyticsHandler = new Analytics();

document.addEventListener("DOMContentLoaded", function () {
  const distances = getDistances();
  if (!distances) return;
  const dateJSON = distances[0]["time"];
  const isNextWeek = ValidateWeek(dateJSON) >= 1 ? true : false;
  if (isNextWeek) {
    clearStorage();
    showAlert("The week is over and all entries are cleared!");
    return;
  }
  const listitems = createElementList(distances);
  showDistances(listitems);
  const distanceValues = getDistanceValues(distances);
  analyticsHandler.analyticsCompute(distanceValues);
});

function clearStorage() {
  localStorage.setItem("distance", null);
}

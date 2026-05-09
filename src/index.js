import "./style.css";
import { retrieveWeatherData, processWeatherData } from "./weather.js";

const formHandler = (function () {
  const locationInput = document.querySelector("#location");

  function getWeatherData() {
    const promise = retrieveWeatherData(locationInput.value).then((data) => {
      const processedData = processWeatherData(data);
      return processedData;
    });
    return promise;
  }

  return { getWeatherData, };
})();

const displayHandler = (function() {
  const dayScroller = document.querySelector("div.day-scroller > div");

  function displayDataToScroller(dayData) {
    [...dayScroller.children].forEach(child => child.remove());
    dayData.forEach(day => {
      const div = document.createElement("div");
      div.classList.add("day");


      dayScroller.appendChild(div);
    });
  }

  return { displayDataToScroller, };
})();

document.querySelector("button.submit").addEventListener("click", (evt) => {
  evt.preventDefault();
  formHandler.getWeatherData().then((data) => {
    console.log(data);
    displayHandler.displayDataToScroller(data.forecast);
  });
});

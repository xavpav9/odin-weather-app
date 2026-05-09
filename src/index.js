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
  const tempType = document.querySelector("#temp-type");
  let currentDayData = [];

  function displayDataToScroller(dayData) {
    [...dayScroller.children].forEach(child => child.remove());
    dayData.forEach((day, index) => {
      const div = document.createElement("div");
      const icon = document.createElement("img");
      const date = document.createElement("div");
      const maxTemp = document.createElement("div");
      const minTemp = document.createElement("div");

      div.classList.add("day");

      date.classList.add("date");

      maxTemp.classList.add("temp");
      maxTemp.classList.add("high");
      maxTemp.setAttribute("title", "high");

      minTemp.classList.add("temp");
      minTemp.classList.add("low");
      minTemp.setAttribute("title", "low");


      const datetime = new Date(day.datetime);
      date.textContent = getDateString(datetime);

      [minTemp.textContent, maxTemp.textContent] = getTempStrings(tempType.value, day.tempmin, day.tempmax);

      import(`./images/${day.icon}.svg`).then(image => {
        icon.src = image.default;
      });


      div.appendChild(icon);
      div.appendChild(date);
      div.appendChild(maxTemp);
      div.appendChild(minTemp);

      dayScroller.appendChild(div);
    });
  }

  function getTempStrings(tempTypeValue, tempMin, tempMax) {
    if (tempTypeValue == "fahrenheit") {
      return [`${tempMin.toFixed(1)} °F`, `${tempMax.toFixed(1)} °F`];
    } else {
      return [`${((tempMin-32)*5/9).toFixed(1)} °C`, `${((tempMax-32)*5/9).toFixed(1)} °C`];
    }
  }

  function getDateString(datetime) {
    let dateString = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"][datetime.getDay()];
    dateString += " " + datetime.getDate();

    if (datetime.getDate() >= 11 && datetime.getDate() <= 13) dateString += "th";
    else {
      switch (datetime.getDate() % 10) {
        case 1:
          dateString += "st";
          break;
        case 2:
          dateString += "nd";
          break;
        case 3:
          dateString += "rd";
          break;
        default:
          dateString += "th";
          break;
      }
    }

    return dateString;
  }

  return { displayDataToScroller, currentDayData, };
})();

document.querySelector("button.submit").addEventListener("click", (evt) => {
  evt.preventDefault();
  formHandler.getWeatherData().then((data) => {
    console.log(data);
    displayHandler.currentDayData = data.forecast;
    displayHandler.displayDataToScroller(data.forecast);
  });
});

document.querySelector("#temp-type").addEventListener("change", (evt) => {
  if (displayHandler.currentDayData.length > 0) {
    displayHandler.displayDataToScroller(displayHandler.currentDayData);
  }
});

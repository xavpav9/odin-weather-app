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
  const amHours = document.querySelector(".am-hours");
  const pmHours = document.querySelector(".pm-hours");
  let currentDayData = [];

  function displayDataToScroller(dayData, daySelected=-1) {
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

      minTemp.textContent = getTempString(tempType.value, day.tempmin)
      maxTemp.textContent = getTempString(tempType.value, day.tempmax);

      import(`./images/${day.icon}.svg`).then(image => {
        icon.src = image.default;
      });

      div.addEventListener("click", evt => {
        [...dayScroller.children].forEach(child => child.classList.remove("selected"));
        div.classList.add("selected");
        displayDataToHourly(day);
      });

      if (index === daySelected) {
        div.classList.add("selected");
        displayDataToHourly(day);
      }

      div.appendChild(icon);
      div.appendChild(date);
      div.appendChild(maxTemp);
      div.appendChild(minTemp);

      dayScroller.appendChild(div);
    });
  }

  function getTempString(tempTypeValue, temp) { // temp should be in Fahrenheit
    if (tempTypeValue == "fahrenheit") {
      return `${temp.toFixed(1)} °F`;
    } else {
      return `${((temp-32)*5/9).toFixed(1)} °C`;
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

  function displayDataToHourly(day) {
    [...amHours.children].forEach(child => child.remove());
    [...pmHours.children].forEach(child => child.remove());
    day.hours.forEach((hour, index) => {
      const div = document.createElement("div");
      const icon = document.createElement("img");
      const time = document.createElement("div");
      const temp = document.createElement("div");
      const winddir = document.createElement("div");

      div.classList.add("hour");
      time.classList.add("time");
      temp.classList.add("temp");
      winddir.classList.add("winddir");

      temp.textContent = getTempString(tempType.value, hour.temp);
      winddir.textContent = hour.winddir + "°";
      time.textContent = hour.datetime.split(":").slice(0, 2).join(":");

      import(`./images/${hour.icon}.svg`).then(image => {
        icon.src = image.default;
      });

      div.addEventListener("click", evt => {
        [...amHours.children].forEach(child => child.classList.remove("selected"));
        [...pmHours.children].forEach(child => child.classList.remove("selected"));
        div.classList.add("selected");
        displayDataToSidebar(day);
      });

      div.appendChild(icon);
      div.appendChild(time);
      div.appendChild(temp);
      div.appendChild(winddir);

      if (index < 12) amHours.appendChild(div);
      else pmHours.appendChild(div);
    });
  }

  function displayDataToSidebar(hour) {
  }

  return { displayDataToScroller, currentDayData, displayDataToHourly, displayDataToSidebar, };
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
    const daySelected = [...document.querySelector("div.day-scroller > div").children].findIndex(child => {
      return child.classList.contains("selected");
    });
    displayHandler.displayDataToScroller(displayHandler.currentDayData, daySelected);
  }
});

import "./style.css";
import { retrieveWeatherData, processWeatherData } from "./weather.js";

const formHandler = (function () {
  const locationInput = document.querySelector("#location");
  const submitBtn = document.querySelector("button.submit");

  function getWeatherData() {
    submitBtn.setAttribute("disabled", true);
    const promise = retrieveWeatherData(locationInput.value).then((data) => {
      const processedData = processWeatherData(data);
      return processedData;
    });
    submitBtn.removeAttribute("disabled");
    return promise;
  }

  return { getWeatherData, };
})();

const displayHandler = (function() {
  const dayScroller = document.querySelector("div.day-scroller > div");
  const tempType = document.querySelector("#temp-type");
  const amHours = document.querySelector(".am-hours");
  const pmHours = document.querySelector(".pm-hours");
  const sidebar = document.querySelector(".hour-info");
  let currentDayData = [];

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

  function convertToCompassDirection(degrees) {
    if (degrees + 22.5 > 360) return "N";
    else return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor((degrees + 22.5) / 45)];
  }

  function displayDataToScroller(dayData, daySelected=-1, hourSelected=-1) {
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
        if (div.classList.contains("selected")) {
          [...amHours.children].forEach(child => child.remove());
          [...pmHours.children].forEach(child => child.remove());
          [...sidebar.children].forEach(child => child.remove());
          div.classList.remove("selected");
        } else {
          [...dayScroller.children].forEach(child => child.classList.remove("selected"));
          div.classList.add("selected");
          displayDataToSidebar(day, true);
          displayDataToHourly(day);
        }
      });

      if (index === daySelected) {
        div.classList.add("selected");
        displayDataToSidebar(day, true);
        displayDataToHourly(day, hourSelected);
      }

      div.appendChild(icon);
      div.appendChild(date);
      div.appendChild(maxTemp);
      div.appendChild(minTemp);

      dayScroller.appendChild(div);
    });
  }

  function displayDataToHourly(day, hourSelected=-1) {
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
      winddir.textContent = convertToCompassDirection(hour.winddir);
      time.textContent = hour.datetime.split(":").slice(0, 2).join(":");

      import(`./images/${hour.icon}.svg`).then(image => {
        icon.src = image.default;
      });

      div.addEventListener("click", evt => {
        if (div.classList.contains("selected")) {
          displayDataToSidebar(day, true);
          div.classList.remove("selected");
        } else {
          [...amHours.children].forEach(child => child.classList.remove("selected"));
          [...pmHours.children].forEach(child => child.classList.remove("selected"));
          div.classList.add("selected");
          displayDataToSidebar(hour);
        }
      });

      if (hourSelected === index) {
        div.classList.add("selected");
        displayDataToSidebar(hour);
      }

      div.appendChild(icon);
      div.appendChild(time);
      div.appendChild(temp);
      div.appendChild(winddir);

      if (index < 12) amHours.appendChild(div);
      else pmHours.appendChild(div);
    });
  }

  function displayDataToSidebar(data, general=false) {
    [...sidebar.children].forEach(child => child.remove());
    const h2 = document.createElement("h2");
    const statistics = document.createElement("div");
    const temp = document.createElement("div");
    const feelslike = document.createElement("div");
    const snow = document.createElement("div");
    const pressure = document.createElement("div");
    const humidity = document.createElement("div");
    const windspeed = document.createElement("div");
    const cloudcover = document.createElement("div");

    h2.classList.add("address");
    statistics.classList.add("statistics");
    temp.classList.add("temp");
    feelslike.classList.add("feelslike");
    snow.classList.add("snow");
    pressure.classList.add("pressure");
    humidity.classList.add("humidity");
    windspeed.classList.add("windspeed");
    cloudcover.classList.add("cloudcover");

    h2.textContent = data.address.split(" ")[0].split(",")[0][0].toUpperCase() + data.address.split(" ")[0].split(",")[0].slice(1); // Just first word for now.
    temp.textContent = `Temperature: ${getTempString(tempType.value, data.temp)}`;
    feelslike.textContent = `Feels Like: ${getTempString(tempType.value, data.feelslike)}`;
    snow.textContent = `Snow: ${data.snow}`;
    pressure.textContent = `Pressure: ${data.pressure}`;
    humidity.textContent = `Humidity: ${data.humidity}`;
    windspeed.textContent = `Windspeed: ${data.windspeed}`;
    cloudcover.textContent = `Cloudcover: ${data.cloudcover}`;

    statistics.appendChild(temp);
    statistics.appendChild(feelslike);
    statistics.appendChild(pressure);
    statistics.appendChild(humidity);
    statistics.appendChild(windspeed);
    statistics.appendChild(cloudcover);
    statistics.appendChild(snow);

    sidebar.appendChild(h2);


    if (general) {
      const description = document.createElement("div");
      description.classList.add("description");
      description.textContent = data.description;
      sidebar.appendChild(description);

      const visibility = document.createElement("div");
      visibility.classList.add("visibility");
      visibility.textContent = `Visibility: ${data.visibility}`;
      statistics.insertBefore(visibility, windspeed);

      const sunrise = document.createElement("div");
      const sunset = document.createElement("div");
      sunrise.classList.add("sunrise");
      sunset.classList.add("sunset");
      sunrise.textContent = `Sunrise: ${data.sunrise}`;
      sunset.textContent = `Sunset: ${data.sunset}`;
      statistics.appendChild(sunrise);
      statistics.appendChild(sunset);
    } else {
      const time = document.createElement("div");
      time.classList.add("time");
      time.textContent = data.datetime.split(":").slice(0, 2).join(":");
      sidebar.appendChild(time);
    }

    sidebar.appendChild(statistics);
  }

  return { displayDataToScroller, currentDayData, displayDataToHourly, displayDataToSidebar, };
})();

document.querySelector("button.submit").addEventListener("click", (evt) => {
  evt.preventDefault();
  [...document.querySelector(".am-hours").children].forEach(child => child.remove());
  [...document.querySelector(".pm-hours").children].forEach(child => child.remove());
  [...document.querySelector(".hour-info").children].forEach(child => child.remove());
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

    let hourSelected = [...document.querySelector("div.am-hours").children].findIndex(child => {
      return child.classList.contains("selected");
    });
    if (hourSelected === -1) {
      hourSelected = [...document.querySelector("div.pm-hours").children].findIndex(child => {
        return child.classList.contains("selected");
      });
      if (hourSelected !== -1) hourSelected += 12;
    };

    displayHandler.displayDataToScroller(displayHandler.currentDayData, daySelected, hourSelected);
  }
});

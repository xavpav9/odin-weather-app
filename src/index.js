import "./style.css";
import loaderImg from "./images/loader.svg";
import invalidImg from "./images/invalid.svg";
import { retrieveWeatherData, processWeatherData } from "./weather.js";

const formHandler = (function () {
  const locationInput = document.querySelector("#location");
  const unitsInput = document.querySelector("#unit-type");
  const submitBtn = document.querySelector("button.submit");
  const locationList = document.querySelector("#location-list");
  const locationListValues =
    JSON.parse(localStorage.getItem("locationList")) ?? [];

  function getWeatherData() {
    submitBtn.setAttribute("disabled", true);
    const promise = retrieveWeatherData(
      locationInput.value,
      unitsInput.value
    ).then(
      (data) => {
        const processedData = processWeatherData(data);
        return processedData;
      },
      (err) => {
        console.warn(err);
        return "Invalid location";
      }
    );
    submitBtn.removeAttribute("disabled");
    return promise;
  }

  function updateLocationList(newLocation = "") {
    if (newLocation !== "" && !locationListValues.includes(newLocation.toLowerCase().trim()))
      locationListValues.unshift(newLocation.toLowerCase().trim());
    if (locationListValues.length > 10) locationListValues.pop();

    [...locationList.children].forEach((child) => child.remove());
    locationListValues.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      locationList.appendChild(option);
    });

    localStorage.setItem("locationList", JSON.stringify(locationListValues));
  }

  updateLocationList();

  return {
    getWeatherData,
    locationInput,
    submitBtn,
    unitsInput,
    updateLocationList,
  };
})();

const displayHandler = (function () {
  const dayScroller = document.querySelector("div.day-scroller > div");
  const unitType = document.querySelector("#unit-type");
  const amHours = document.querySelector(".am-hours");
  const pmHours = document.querySelector(".pm-hours");
  const sidebar = document.querySelector(".hour-info");
  const now = document.querySelector(".now");
  const currentDayData = [];

  function getUnitsString(name, measurement) {
    const system = unitType.value;
    let unit = "";
    switch (name) {
      case "temperature":
        if (system === "us") unit = "°F";
        else if (system === "uk" || system === "metric") unit = "°C";
        else if (system === "base") unit = "K";
        break;
      case "snow":
        if (system === "us") unit = "inches";
        else unit = "cm";
        break;
      case "windspeed":
        if (system === "us" || system === "uk") unit = "mph";
        else if (system === "base" || system === "metric") unit = "m/s";
        break;
      case "visibility":
        if (system === "us" || system === "uk") unit = "miles";
        else if (system === "base" || system === "metric") unit = "km";
        break;
      case "pressure":
        unit = "Millibars";
        break;
      case "cloudcover":
      case "humidity":
      case "precipitationprob":
        unit = "%";
        break;
    }
    return `${measurement.toFixed(1)} ${unit}`;
  }

  function getDateString(datetime) {
    let dateString = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"][
      datetime.getDay()
    ];
    dateString += " " + datetime.getDate();

    if (datetime.getDate() >= 11 && datetime.getDate() <= 13)
      dateString += "th";
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
    else
      return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor((degrees + 22.5) / 45)
      ];
  }

  function displaySideBarAddress(address, description = "") {
    [...sidebar.children].forEach((child) => child.remove());
    const h3 = document.createElement("h3");
    h3.classList.add("address");
    h3.textContent = address
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
    sidebar.appendChild(h3);

    if (description !== "") {
      const div = document.createElement("div");
      div.classList.add("description");
      div.textContent = description;
      sidebar.appendChild(div);
    }
  }

  function displayDataToScroller(dayData, daySelected = -1, hourSelected = -1) {
    [...dayScroller.children].forEach((child) => child.remove());

    displaySideBarAddress(dayData[0].address, dayData[0].weekdescription);

    dayData.forEach((day, index) => {
      const btn = document.createElement("button");
      const icon = document.createElement("img");
      const date = document.createElement("div");
      const maxTemp = document.createElement("div");
      const minTemp = document.createElement("div");

      btn.classList.add("day");

      date.classList.add("date");

      maxTemp.classList.add("temp");
      maxTemp.classList.add("high");
      maxTemp.setAttribute("title", "high");

      minTemp.classList.add("temp");
      minTemp.classList.add("low");
      minTemp.setAttribute("title", "low");

      const datetime = new Date(day.datetime);
      date.textContent = getDateString(datetime);

      minTemp.textContent = getUnitsString("temperature", day.tempmin);
      maxTemp.textContent = getUnitsString("temperature", day.tempmax);

      import(`./images/icons/${day.icon}.svg`).then((image) => {
        icon.src = image.default;
      });

      btn.addEventListener("click", (evt) => {
        if ([...btn.classList].includes("selected")) {
          [...amHours.children].forEach((child) => child.remove());
          [...pmHours.children].forEach((child) => child.remove());
          [...sidebar.children].forEach((child) => child.remove());
          displaySideBarAddress(dayData[0].address, dayData[0].weekdescription);
          btn.classList.remove("selected");
          localStorage.removeItem("daySelected");
          localStorage.removeItem("hourSelected");
        } else {
          [...dayScroller.children].forEach((child) =>
            child.classList.remove("selected")
          );
          btn.classList.add("selected");
          displayDataToSidebar(day, true);
          displayDataToHourly(day);
          localStorage.setItem("daySelected", JSON.stringify(index));
          localStorage.removeItem("hourSelected");
        }
      });

      if (index === daySelected) {
        btn.classList.add("selected");
        displayDataToSidebar(day, true);
        displayDataToHourly(day, hourSelected);
      }

      btn.appendChild(icon);
      btn.appendChild(date);
      btn.appendChild(maxTemp);
      btn.appendChild(minTemp);

      dayScroller.appendChild(btn);
    });
  }

  function displayDataToHourly(day, hourSelected = -1) {
    [...amHours.children].forEach((child) => child.remove());
    [...pmHours.children].forEach((child) => child.remove());
    day.hours.forEach((hour, index) => {
      const btn = document.createElement("button");
      const icon = document.createElement("img");
      const time = document.createElement("div");
      const temp = document.createElement("div");
      const winddir = document.createElement("div");

      btn.classList.add("hour");
      time.classList.add("time");
      temp.classList.add("temp");
      winddir.classList.add("winddir");

      winddir.setAttribute("title", "wind direction");

      temp.textContent = getUnitsString("temperature", hour.temp);
      winddir.textContent = convertToCompassDirection(hour.winddir);
      time.textContent = hour.datetime.split(":").slice(0, 2).join(":");

      import(`./images/icons/${hour.icon}.svg`).then((image) => {
        icon.src = image.default;
      });

      btn.addEventListener("click", (evt) => {
        if ([...btn.classList].includes("selected")) {
          displayDataToSidebar(day, true);
          btn.classList.remove("selected");
          localStorage.removeItem("hourSelected");
        } else {
          [...amHours.children].forEach((child) =>
            child.classList.remove("selected")
          );
          [...pmHours.children].forEach((child) =>
            child.classList.remove("selected")
          );
          btn.classList.add("selected");
          displayDataToSidebar(hour);
          localStorage.setItem("hourSelected", JSON.stringify(index));
        }
      });

      if (hourSelected === index) {
        btn.classList.add("selected");
        displayDataToSidebar(hour);
      }

      btn.appendChild(icon);
      btn.appendChild(time);
      btn.appendChild(temp);
      btn.appendChild(winddir);

      if (index < 12) amHours.appendChild(btn);
      else pmHours.appendChild(btn);
    });
  }

  function displayDataToSidebar(data, general = false) {
    [...sidebar.children].forEach((child) => child.remove());
    const statistics = document.createElement("div");
    const temp = document.createElement("div");
    const feelslike = document.createElement("div");
    const precipitationProb = document.createElement("div");
    const snow = document.createElement("div");
    const pressure = document.createElement("div");
    const humidity = document.createElement("div");
    const windspeed = document.createElement("div");
    const cloudcover = document.createElement("div");

    statistics.classList.add("statistics");
    temp.classList.add("temp");
    feelslike.classList.add("feelslike");
    precipitationProb.classList.add("precipitation-prob");
    snow.classList.add("snow");
    pressure.classList.add("pressure");
    humidity.classList.add("humidity");
    windspeed.classList.add("windspeed");
    cloudcover.classList.add("cloudcover");

    temp.textContent = `Temperature: ${getUnitsString("temperature", data.temp)}`;
    feelslike.textContent = `Feels Like: ${getUnitsString("temperature", data.feelslike)}`;
    precipitationProb.textContent = `Precipitation: ${getUnitsString("precipitationprob", data.precipprob)}`;
    snow.textContent = `Snow: ${getUnitsString("snow", data.snow)}`;
    pressure.textContent = `Pressure: ${getUnitsString("pressure", data.pressure)}`;
    humidity.textContent = `Humidity: ${getUnitsString("humidity", data.humidity)}`;
    windspeed.textContent = `Windspeed: ${getUnitsString("windspeed", data.windspeed)}`;
    cloudcover.textContent = `Cloudcover: ${getUnitsString("cloudcover", data.cloudcover)}`;

    statistics.appendChild(temp);
    statistics.appendChild(feelslike);
    statistics.appendChild(precipitationProb);
    statistics.appendChild(pressure);
    statistics.appendChild(humidity);
    statistics.appendChild(windspeed);
    statistics.appendChild(cloudcover);
    statistics.appendChild(snow);

    displaySideBarAddress(data.address);

    if (general) {
      const description = document.createElement("div");
      description.classList.add("description");
      description.textContent = data.description;
      sidebar.appendChild(description);

      const visibility = document.createElement("div");
      visibility.classList.add("visibility");
      visibility.textContent = `Visibility: ${getUnitsString("visibility", data.visibility)}`;
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

  function displayDataToNow(data) {
    const statistics = document.createElement("div");
    const time = document.createElement("div");
    const temp = document.createElement("div");
    const feelslike = document.createElement("div");
    const conditions = document.createElement("div");
    const precipitationProb = document.createElement("div");
    const windspeed = document.createElement("div");
    const cloudcover = document.createElement("div");
    const icon = document.createElement("img");

    statistics.classList.add("statistics");
    time.classList.add("time");
    temp.classList.add("temp");
    feelslike.classList.add("feelslike");
    conditions.classList.add("conditions");
    precipitationProb.classList.add("precipitation-prob");
    windspeed.classList.add("windspeed");
    cloudcover.classList.add("cloudcover");

    time.textContent = `At ${data.time}`;
    temp.textContent = `Temperature: ${getUnitsString("temperature", data.temp)}`;
    feelslike.textContent = `Feels Like: ${getUnitsString("temperature", data.feelslike)}`;
    conditions.textContent = data.conditions;
    precipitationProb.textContent = `Precipitation: ${getUnitsString("precipitationprob", data.precipprob)}`;
    windspeed.textContent = `Windspeed: ${getUnitsString("windspeed", data.windspeed)} - ${convertToCompassDirection(data.winddir)}`;
    cloudcover.textContent = `Cloudcover: ${getUnitsString("cloudcover", data.cloudcover)}`;

    import(`./images/icons/${data.icon}.svg`).then((image) => {
      icon.src = image.default;
    });

    statistics.appendChild(icon);
    statistics.appendChild(time);
    statistics.appendChild(conditions);
    statistics.appendChild(temp);
    statistics.appendChild(feelslike);
    statistics.appendChild(precipitationProb);
    statistics.appendChild(windspeed);
    statistics.appendChild(cloudcover);

    now.appendChild(statistics);
  }

  function displayLoader() {
    const img = document.createElement("img");
    const p = document.createElement("p");
    img.classList.add("loader");
    img.src = loaderImg;
    p.textContent = "Loading...";
    now.appendChild(img);
    now.appendChild(p);
  }

  function displayInvalid() {
    const img = document.createElement("img");
    const p = document.createElement("p");
    img.classList.add("invalid");
    img.src = invalidImg;
    p.textContent = "Invalid location";
    now.appendChild(img);
    now.appendChild(p);
  }

  function clearData() {
    [...document.querySelector(".day-scroller > div").children].forEach(
      (child) => child.remove()
    );
    [...document.querySelector(".am-hours").children].forEach((child) =>
      child.remove()
    );
    [...document.querySelector(".pm-hours").children].forEach((child) =>
      child.remove()
    );
    [...document.querySelector(".hour-info").children].forEach((child) =>
      child.remove()
    );
    [...document.querySelector(".now").children].forEach((child) =>
      child.remove()
    );
  }

  return {
    displayDataToScroller,
    currentDayData,
    displayDataToHourly,
    displayDataToSidebar,
    displayDataToNow,
    displayLoader,
    displayInvalid,
    clearData,
  };
})();

formHandler.submitBtn.addEventListener("click", (evt) => {
  evt.preventDefault();
  displayHandler.clearData();
  displayHandler.displayLoader();
  const timeOfRequest = JSON.parse(localStorage.getItem("timeOfRequest"));

  if (evt.isTrusted || (timeOfRequest !== null && timeOfRequest + 1 * 60 * 60 * 1000 < Date.now())) { // After 1hr, refresh request
    ["data", "location", "daySelected", "hourSelected", "units"].forEach(
      (item) => localStorage.removeItem(item)
    );

    formHandler.getWeatherData().then((data) => {
      displayHandler.clearData();
      if (data === "Invalid location") {
        displayHandler.displayInvalid();
      } else {
        console.info(data);
        displayHandler.currentDayData = data.forecast;
        displayHandler.displayDataToScroller(data.forecast);
        displayHandler.displayDataToNow(data.now);
        localStorage.setItem(
          "location",
          JSON.stringify(formHandler.locationInput.value)
        );
        localStorage.setItem(
          "units",
          JSON.stringify(formHandler.unitsInput.value)
        );
        localStorage.setItem("data", JSON.stringify(data));
        localStorage.setItem("timeOfRequest", JSON.stringify(Date.now()));
        formHandler.updateLocationList(formHandler.locationInput.value);
      }
    });
  } else {
    const savedLocation = JSON.parse(localStorage.getItem("location"));
    const savedUnits = JSON.parse(localStorage.getItem("units"));
    let savedDaySelected =
      JSON.parse(localStorage.getItem("daySelected")) ?? -1;
    let savedHourSelected =
      JSON.parse(localStorage.getItem("hourSelected")) ?? -1;
    const savedData = JSON.parse(localStorage.getItem("data"));

    savedDaySelected = +savedDaySelected;
    savedHourSelected = +savedHourSelected;
    formHandler.locationInput.value = savedLocation;
    formHandler.unitsInput.value = savedUnits;

    console.info(savedData);
    displayHandler.clearData();
    displayHandler.currentDayData = savedData.forecast;
    displayHandler.displayDataToScroller(
      savedData.forecast,
      savedDaySelected,
      savedHourSelected
    );
    displayHandler.displayDataToNow(savedData.now);
  }
});

if (JSON.parse(localStorage.getItem("location")) !== null) {
  formHandler.submitBtn.dispatchEvent(new Event("click"));
}

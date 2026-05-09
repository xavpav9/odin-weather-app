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

  return { getWeatherData };
})();

document.querySelector("button.submit").addEventListener("click", (evt) => {
  evt.preventDefault();
  formHandler.getWeatherData().then((data) => {
    console.log(data);
  });
});

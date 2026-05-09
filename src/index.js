import "./style.css";
import {retrieveWeatherData, processWeatherData} from "./weather.js";

retrieveWeatherData("london").then(data => {
  console.log(data);
  console.log(processWeatherData(data));
});


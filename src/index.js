import "./style.css";
import {retrieveWeatherData} from "./weather.js";

retrieveWeatherData("london").then(data => {
  console.log(data);
});

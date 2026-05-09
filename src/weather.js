async function retrieveWeatherData(location) {
  let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=87SUCVV2HUAUN4VRLYF4A6QVC`);
  let data = response.json();
  return data;
}

export { retrieveWeatherData };

async function retrieveWeatherData(location) {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=87SUCVV2HUAUN4VRLYF4A6QVC`
  );
  const data = response.json();
  return data;
}

function processWeatherData(data) {
  return {
    address: data.resolvedAddress,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    now: {
      temp: data.currentConditions.temp,
      feelslike: data.currentConditions.feelslike,
      conditions: data.currentConditions.conditions,
      snow: data.currentConditions.snow,
      visibility: data.currentConditions.visibility,
      windspeed: data.currentConditions.windspeed,
      cloudcover: data.currentConditions.cloudcover,
      sunrise: data.currentConditions.sunrise,
      sunset: data.currentConditions.sunset,
      winddir: data.currentConditions.winddir,

      icon: data.currentConditions.icon,
    },
    forecast: data.days.map((day) => {
      return {
        datetime: day.datetime,
        description: day.description,
        temp: day.temp,
        tempmin: day.tempmin,
        tempmax: day.tempmax,
        conditions: day.conditions,
        snow: day.snow,
        visibility: day.visibility,
        windspeed: day.windspeed,
        cloudcover: day.cloudcover,
        sunrise: day.sunrise,
        sunset: day.sunset,
        winddir: day.winddir,

        icon: day.icon,

        hours: day.hours.map((hour) => {
          return {
            datetime: hour.datetime,
            temp: hour.temp,
            windspeed: hour.windspeed,
            winddir: hour.winddir,
          }
        }),
      };
    }),
  };
}

export { retrieveWeatherData, processWeatherData };

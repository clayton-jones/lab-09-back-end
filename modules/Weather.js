'use strict';


const superagent = require('superagent');
const sendJson = require('./SendJSON');
const errorHandler = require('./ErrorHandler');

module.exports = weatherHandler;

function weatherHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  getWeather(lat, lon)
    .then(summaries => sendJson(summaries, response))
    .catch(error => errorHandler(error, request, response));
}


function getWeather (lat, lon) {
  // console.log('Inside getWeather');
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lon}`;
  return superagent.get(url)
    .then(data => {
      return parseWeather(data.body);
    });
}

function parseWeather(data) {
  try {
    let weatherArr = data.daily.data.map(obj => {
      return new Weather(obj);
    });
    return Promise.resolve(weatherArr);

  }
  catch (error) {
    return Promise.reject(error);
  }
}

function Weather (weatherObj) {
  this.time = new Date(weatherObj.time * 1000).toString().slice(0, 15);
  this.forecast = weatherObj.summary;
}


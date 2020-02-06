'use strict';


const superagent = require('superagent');
const sendJson = require('./SendJSON');
const errorHandler = require('./ErrorHandler');

module.exports = eventsHandler;

function eventsHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  getEvents(lat, lon)
    .then(events => sendJson(events, response))
    .catch(error => errorHandler(error, request, response));
}


function getEvents (lat, lon) {
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${lat},${lon}&within=10&page_size=20&date=Future`;
  return superagent.get(url)
    .then(data => {
      return parseEvents(data);
    });
}

function parseEvents(data) {
  try {
    const eventArr = JSON.parse(data.text).events.event;
    let arrayEvents = eventArr.map(event => {
      return new Event (event);
    });
    return Promise.resolve(arrayEvents);
  }
  catch (error) {
    return Promise.reject(error);
  }
}

function Event (event) {
  this.link = event.url;
  this.name = event.title;
  this.event_date = new Date(event.start_time).toDateString();
  this.summary = event.description;
}

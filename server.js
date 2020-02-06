'use strict';

//load environment variables from the .env
require('dotenv').config();

//declare application dependencies
const express = require('express');
const cors = require('cors');

//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// Module Dependencies
const locationHandler = require('./modules/Location.js');
const weatherHandler = require('./modules/Weather.js');
const events = require('./modules/Events.js');
const movieHandler = require('./modules/Movies.js');
const yelpHandler = require('./modules/Yelp.js');

// Endpoint calls
//route syntax = app.<operation>('<route>', callback);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);

// Endpoint callback functions
// function yelpHandler(request, response){
//   const city = request.query.search_query;
//   yelp(city)
//     .then (yelps => sendJson(yelps, response))
//     .catch(error => errorHandler(error, request, response));
// }

// function movieHandler(request, response) {
//   const city = request.query.search_query;
//   movies(city)
//     .then (movieData => sendJson(movieData, response))
//     .catch(error => errorHandler(error, request, response));
// }

// function locationHandler(request, response) {
//   const city = request.query.city;
//   location.getLocationData(city)
//     .then(data => {
//       sendJson(data, response);

//     })
//     .catch(error => errorHandler(error, request, response));
// }

// function weatherHandler(request, response) {
//   const lat = request.query.latitude;
//   const lon = request.query.longitude;
//   weather(lat, lon)
//     .then(summaries => sendJson(summaries, response))
//     .catch(error => errorHandler(error, request, response));
// }

function eventsHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  events(lat, lon)
    .then(events => sendJson(events, response))
    .catch(error => errorHandler(error, request, response));
}

// Helper functions
function sendJson (data, response) {
  response.status(200).send(data);
}

function errorHandler (error, request, response) {
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server up on port ${PORT}`));





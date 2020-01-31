'use strict';

//load environment variables from the .env
require('dotenv').config();

//declare application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);

//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// Module Dependencies
const location = require('./modules/Location.js');
const weather = require('./modules/Weather.js');
const events = require('./modules/Events.js');
const movies = require('./modules/Movies.js');

// Endpoint calls
//route syntax = app.<operation>('<route>', callback);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);

// Constructors
function Yelp(rest) {
  this.name = rest.name;
  this.image_url = rest.image_url;
  this.price = rest.price;
  this.rating = rest.rating;
  this.url = rest.url;
}

// Endpoint callback functions
function yelpHandler(request, response){
  try{
    const city = request.query.search_query;
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    // console.log(yelpUrl);
    superagent.get(yelpUrl)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then (data =>{
        response.send(data.body.businesses.map(rest =>{
          return new Yelp(rest);
        }));
      });
  }
  catch(error){
    errorHandler(error, request, response);
  }
}

function movieHandler(request, response) {
  const city = request.query.search_query;
  movies(city)
    .then (movieData => sendJson(movieData, response))
    .catch(error => errorHandler(error, request, response));
}

function locationHandler(request, response) {
  // console.log('locationHandler request.query.city:', request.query.city);
  const city = request.query.city;
  location.getLocationData(city)
    .then(data => {
      // console.log('server.js locationHandler data:', data);
      sendJson(data, response);

    })
    .catch(error => errorHandler(error, request, response));
}

function weatherHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  weather(lat, lon)
    .then(summaries => sendJson(summaries, response))
    .catch(error => errorHandler(error, request, response));
}

function eventsHandler(request, response) {

  // getEvents(lat, lon).then(sendJson).catch(error)
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





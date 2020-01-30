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


function Movie (movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}



function Event (event) {
  this.link = event.url;
  this.name = event.title;
  this.event_date = new Date(event.start_time).toDateString();
  this.summary = event.description;
}

// Endpoint callback functions
function yelpHandler(request, response){
  try{
    const city = request.query.search_query;
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    console.log(yelpUrl);
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
  try {
    const city = request.query.search_query;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;
    superagent.get(url)
      .then (data => {
        response.send(data.body.results.map(movie => {
          return new Movie(movie);
        }));
      });
  }
  catch(error) {
    errorHandler(error, request, response);
  }
}

function locationHandler(request, response) {
  console.log('ALIVE');
  const city = request.query.city;
  location.getLocationData(city)
    .then(data => sendJson(data, response))
    .catch(error => errorHandler(error, request, response));
}

function weatherHandler(request, response) {
  console.log('Inside weatherHandler');
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  weather(lat, lon)
    .then(summaries => sendJson(summaries, response))
    .catch(error => errorHandler(error, request, response));
}

function eventsHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    console.log('lat & lon', lat, lon);
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${lat},${lon}&within=10&page_size=20&date=Future`;
    superagent.get(url)
      .then(data => {
        const eventArr = JSON.parse(data.text).events.event;
        let arrayEvents = eventArr.map(event => {
          return new Event (event);
        });
        response.send(arrayEvents);
      });
  }
  catch(error) {
    errorHandler(error, request, response);
  }
}

// Helper functions
function sendJson (data, response) {
  response.status(200).send(data);
}

function errorHandler (error, request, response) {
  console.log('inside errorHandler');
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server up on port ${PORT}`));





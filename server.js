'use strict';

//load environment variables from the .env
require('dotenv').config();

//declare application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());


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

function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather (time, forecast) {
  this.time = time;
  this.forecast = forecast;
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
  try {
    const city = request.query.city;
    let SQL = 'SELECT search_query, formatted_query, latitude, longitude FROM cities WHERE search_query=$1;';

    client.query(SQL, [city])
      .then(data => {
        if (data.rowCount) {
          response.send(data.rows[0]);
        } else {
          let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json&limit-1`;

          superagent.get(url)
            .then(data => {
              const geoData = data.body[0];
              const locationData = new Location(city, geoData);
              let {search_query, formatted_query, latitude, longitude} = locationData;
              let SQLarray = [search_query, formatted_query, latitude, longitude];
              let SQL = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;';
              client.query(SQL, SQLarray);
              response.send(locationData);
            });
        }
      });
  }
  catch(error) {
    errorHandler(error, request, response);
  }
}

// function cacheLocation (city, data) {

// }

function weatherHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lon}`;
    superagent.get(url)
      .then(data => {
        let weatherArr = data.body.daily.data.map(obj => {
          // Adreinne helped solve the time display issue
          let time = new Date(obj.time * 1000).toString().slice(0, 15);
          return new Weather(time, obj.summary);

        });
        response.send(weatherArr);
      });
  }
  catch (error) {
    errorHandler(error, request, response);
  }
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

// Error Handler function

function errorHandler (error, request, response) {
  console.log('inside errorHandler');
  response.status(500).send(error);
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
  })
  .catch(err => {
    console.log('pg connect error ', err);
  });




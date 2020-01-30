'use strict';

const superagent = require('superagent');
const client = require('./Client');

const location = {};

location.getLocationData = function (city) {
  console.log('Inside getLocationData');
  let SQL = 'SELECT search_query, formatted_query, latitude, longitude FROM cities WHERE search_query=$1;';
  console.log('Inside getLocationData2');

  return client.query(SQL, [city])
    .then(data => {
      console.log('Inside then, inside client query');
      if (data.rowCount) {
        console.log(data.rows[0]);
        return data.rows[0];
      } else {
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json&limit-1`;
        console.log('Inside getLocationData > superagent');
        return superagent.get(url)
          .then(data => {
            return cacheLocation(city, data.body);
          });
      }
    });
};

function cacheLocation (city, data) {
  const locationData = new Location(city, data[0]);
  let {search_query, formatted_query, latitude, longitude} = locationData;
  let SQLarray = [search_query, formatted_query, latitude, longitude];
  let SQL = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;';
  return client.query(SQL, SQLarray)
    .then(results => results.rows[0]);
}

function Location (data) {
  this.search_query = data.city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


module.exports = location;

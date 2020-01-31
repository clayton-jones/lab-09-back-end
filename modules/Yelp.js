'use strict';

const superagent = require('superagent');

module.exports = getYelp;

function getYelp (city) {
  const yelpUrl = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  return superagent.get(yelpUrl)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then (data =>{
      return (data.body.businesses.map(rest =>{
        return new Yelp(rest);
      }));
    });
}

function Yelp(rest) {
  this.name = rest.name;
  this.image_url = rest.image_url;
  this.price = rest.price;
  this.rating = rest.rating;
  this.url = rest.url;
}

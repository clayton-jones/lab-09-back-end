'use strict';

const superagent = require('superagent');

module.exports = getMovies;

// movie handler function

function getMovies (city) {
  console.log('inside getMovies: HI!')
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;
  return superagent.get(url)
    .then (data => {
      return (data.body.results.map(movie => {
        return new Movie(movie);
      }));
    });
}

// constructor for the movies

function Movie (movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}

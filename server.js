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
const eventsHandler = require('./modules/Events.js');
const movieHandler = require('./modules/Movies.js');
const yelpHandler = require('./modules/Yelp.js');

// Endpoint calls
//route syntax = app.<operation>('<route>', callback);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);


app.listen(PORT, () => console.log(`Server up on port ${PORT}`));





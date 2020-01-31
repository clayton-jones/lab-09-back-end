'use strict';


const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error('pg problem', err));

module.exports = client;

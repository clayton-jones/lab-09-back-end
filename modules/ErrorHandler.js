'use strict';

function errorHandler (error, request, response) {
  response.status(500).send(error);
}

module.exports = errorHandler;

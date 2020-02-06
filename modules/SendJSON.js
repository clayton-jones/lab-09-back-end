'use strict';

function sendJson (data, response) {
  response.status(200).send(data);
}

module.exports = sendJson;

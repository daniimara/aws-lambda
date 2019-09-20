'use strict';

require('dotenv').config();

const lib = require('./');

module.exports.thumbnail = (event, context, callback) => {

  let body = JSON.parse(event.body);

  if (!body.url || typeof body.url !== 'string') {
    callback(new Error('Please provide an image url'));
  }

  if (!process.env.THUMBNAILS_BUCKET) {
    callback(new Error('Please provide a THUMBNAILS_BUCKET env var'));
  }

  return lib.generateThumbnail(body.url)
    .then(thumbnailUrl => {
      const body = {
        message: 'Success! Here is your thumbnail image:',
        thumbnailUrl: thumbnailUrl,
      };
      console.log('thumbnail - body: ', body);
      const response = {
        statusCode: 200,
        body: JSON.stringify(body),
      };

      callback(null, response);
    })
    .catch(e => {
      callback(e);
    });
};

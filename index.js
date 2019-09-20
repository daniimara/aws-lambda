'use strict';

const BbPromise = require('bluebird');
const gm = require('gm').subClass({imageMagick: true});
const shortid = require('shortid');
const AWS = require('aws-sdk');
const s3 = BbPromise.promisifyAll(new AWS.S3({ region: process.env.AWS_REGION, apiVersion: '2006-03-01' }), {suffix: 'MySuffix'});

BbPromise.promisifyAll(gm.prototype, {suffix: 'MySuffix'});

const imageThumbnail = require('image-thumbnail');

module.exports = {
  generateThumbnail(url) {
    let options = { width: 250, height: 250 }
    return imageThumbnail({ uri: url }, options)
    .then(imgBuffer => {
      return this.uploadToS3(imgBuffer)
    })
    .catch(err => console.error(err));
  },

  async uploadToS3(imgBuffer) {
    const imgBucket = process.env.THUMBNAILS_BUCKET;
    const key = ['thumbnails', shortid.generate() + '.jpg'].join('/');
    const params = {
        Bucket: imgBucket,
        Key: key,
        ACL: 'public-read',
        Body: imgBuffer,
        ContentType: 'image/jpeg'
    };

    let thumbnailUrl = await new Promise(resolve => s3.upload(params, function(err, data) {
      resolve(data.Location)
    }));
    return thumbnailUrl;
  }
};




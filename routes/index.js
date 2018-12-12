var express = require('express');
// var User = require('../models/user');

var router = express.Router();

// const crypto = require("crypto");
const Contest = require('../models/contest');
const catchErrors = require('../lib/async-error');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
// console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

const uuidv4 = require('uuid/v4');


router.get('/s3', function(req, res, next) {
  const s3 = new aws.S3({region: 'ap-northeast-2'});
  const filename = req.query.filename;
  const type = req.query.type;
  const uuid = uuidv4();
  const params = {
    Bucket: S3_BUCKET,
    key: uuid + '/'+ filename,
    Expires: 900,
    ContentType: type,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', params, function(err, data) {
    if(err){
      console.log(err);
      return res.json({err: err});
    }
    res.json({
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`
    });
  });
});
/* GET home page. */

router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {commision: {'$regex' : 'open'}};


  const contests = await Contest.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });


  res.render('index', {contests: contests, query: req.query});
}));



module.exports = router;

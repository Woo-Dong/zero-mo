var express = require('express');
// var User = require('../models/user');

var router = express.Router();

// const crypto = require("crypto");
const Contest = require('../models/contest');
const catchErrors = require('../lib/async-error');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

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

  var query = {};
  const term = req.query.term;
  const catTerm = req.query.catTerm;
  if (term) {
    query = {$or: [
      {company: {'$regex': term, '$options': 'i'}}
    ]};
  }

  const contests = await Contest.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });


  res.render('index', {contests: contests, query: req.query});
}));

router.get('/', catchErrors(async (req, res, next) => {
  var query_cate = {};
  const term_cate = req.query.term_cate;
  if (term_cate) {
    query_cate =
      {category: {'$regex': term_cate, '$options': 'i'}};
    }
  res.render('/contests/index', {query_cate: req.query_cate});
}));


// router.post('/signin', function(req, res, next) {
//   User.findOne({idname: req.body.idname}, function(err, user) {
//     let inputPassword = req.body.password;
//     let hashPassword = crypto.createHash("sha512").update(inputPassword + user.salt).digest("hex");
//     if (err) {
//       res.render('error', {message: "Error", error: err});
//     } else if (!user || user.password !== hashPassword) {
//       req.flash('danger', 'Invalid username or password.');
//       res.redirect('back');
//     } else {
//       req.session.user = user;
//       req.flash('success', 'Welcome!');
//       res.redirect('/');
//     }
//   });
// });


module.exports = router;

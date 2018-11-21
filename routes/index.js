var express = require('express'),
  User = require('../models/user');

var router = express.Router();

const crypto = require("crypto");
const Contest = require('../models/contest');
const catchErrors = require('../lib/async-error');

/* GET home page. */

router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  const catTerm = req.query.catTerm;
  if (term) {
    query = {$or: [
      // {title: {'$regex': term, '$options': 'i'}},
      // {content: {'$regex': term, '$options': 'i'}},
      // {category: {'$regex': term, '$options': 'i'}},
      // {company_category: {'$regex': term, '$options': 'i'}},
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


// router.get('/', function(req, res, next) {
//   res.render('index')});

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

router.post('/signin', function(req, res, next) {
  User.findOne({idname: req.body.idname}, function(err, user) {
    let inputPassword = req.body.password;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + user.salt).digest("hex");
    if (err) {
      res.render('error', {message: "Error", error: err});
    } else if (!user || user.password !== hashPassword) {
      req.flash('danger', 'Invalid username or password.');
      res.redirect('back');
    } else {
      req.session.user = user;
      req.flash('success', 'Welcome!');
      res.redirect('/');
    }
  });
});

router.get('/signout', function(req, res, next) {
  delete req.session.user;
  req.flash('success', 'Successfully signed out.');
  res.redirect('/');
});

module.exports = router;

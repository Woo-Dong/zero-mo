var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/enroll', function(req, res, next) {
  res.render('enroll');
});

router.get('/logIn', function(req, res, next) {
  res.render('logIn');
});

router.get('/signUp', function(req, res, next) {
  res.render('signUp');
});

module.exports = router;

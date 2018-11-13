var express = require('express'),
  User = require('../models/user');

var router = express.Router();

const crypto = require("crypto");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

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

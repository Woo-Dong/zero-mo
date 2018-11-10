var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/logIn', function(req, res, next) {
    res.render('logIn');
});

router.get('/enroll', function(req, res, next) {
    res.render('enroll');
});

router.get('/signUp', function(req, res, next) {
    res.render('signUp');
});

module.exports = router;
    
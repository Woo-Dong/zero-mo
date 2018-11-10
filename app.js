// 가장 중요한 main 파일
// 실행 웹서버: localhost:3000
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');

var index = require('./routes/index');
var logIn = require('./routes/logIn');
var signUp = require('./routes/signUp');
var enroll = require('./routes/enroll');
// var users = require('./routes/users');
// var questions = require('./routes/questions');
var app = express();

// var sassMiddleware = require('node-sass-middleware');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}
var bodyParser = require('body-parser');
app.locals.moment = require('moment');
app.locals.querystring = require('querystring');



//mongodb connect ------------------------------------
mongoose.Promise = global.Promise;
const connStr = 'mongodb://localhost/mjdb1';
mongoose.connect(connStr, {useMongoClient: true });
mongoose.connection.on('error', console.error);
//mongodb connect ------------------------------------


//Favicon --------------------------------------------
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico') ) );  //favicon: 딱히 필요는 없지만 탭위에 있는 아이콘
app.use(logger('dev') );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Favicon --------------------------------------------

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(methodOverride('_method', {methods: ['POST', 'GET']}));


// app.use(sassMiddleware({
//   src: path.join(__dirname, 'public'),
//   dest: path.join(__dirname, 'public'),
//   indentedSyntax: true, // true = .sass and false = .scss
//   sourceMap: true
// }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // res.locals.currentUser = req.session.user;
  // res.locals.flashMessages = req.flash();
  next();
});

// Route
app.use('/', index);
app.use('/logIn', logIn);
app.use('/signUp', signUp);
app.use('/enroll', enroll);
// app.use('/users', users);
// app.use('/questions', questions);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

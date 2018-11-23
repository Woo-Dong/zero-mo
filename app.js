var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var sassMiddleware = require('node-sass-middleware');

var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');

var passportSocketIo = require('passport.socketio');

var index = require('./routes/index');
var users = require('./routes/users');
var contests = require('./routes/contests');

var passportConfig = require('./lib/passport-config');



module.exports = (app, io) => {
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

  app.locals.moment = require('moment');
  app.locals.querystring = require('querystring');

  //=======================================================
  // mongodb connect
  //=======================================================
  mongoose.Promise = global.Promise; 
  // const connStr = (process.env.NODE_ENV == 'production')?

  const connStr = 
  'mongodb://dbuser:dwpark94@ds115154.mlab.com:15154/zero-mo-ver2';
  // 'mongodb://localhost/dbtest1';

  mongoose.connect(connStr, {useMongoClient: true });
  mongoose.connection.on('error', console.error);

  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico') ) );  
  app.use(logger('dev') );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));


  const sessionStore = new session.MemoryStore();
  const sessionId = 'zero-mo.sid';
  const sessionSecret =  'I AM DONGWOO HAHAHAHHHAAHHA'
  // session을 사용할 수 있도록.
  app.use(session({
    name: sessionId,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    secret: sessionSecret
  }));

  app.use(flash());

  app.use(express.static(path.join(__dirname, 'public')));


  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);


  app.use(function(req, res, next) {
    res.locals.currentUser = req.session.user;
    res.locals.flashMessages = req.flash();
    next();
  });


  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
      key:          sessionId,     
      secret:       sessionSecret,    
      store:        sessionStore,       
      passport:     passport,
      success:      (data, accept) => {
        console.log('successful connection to socket.io');
        accept(null, true);
      }, 
      fail:         (data, message, error, accept) => {
        console.log('failed connection to socket.io:', message);
        accept(null, false);
      }
    }));

    io.on('connection', socket => {
      if (socket.request.user.logged_in) {
        socket.emit('welcome');
        socket.on('join', data => {
          socket.join(socket.request.user._id.toString());
        });
      }
    });

  // Route
  app.use('/', index); 
  app.use('/users', users);
  app.use('/contests', contests(io) );
  require('./routes/auth')(app, passport);
  app.use('/api', require('./routes/api'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = app;


  // amazon S3 =======================
  // user
  return app;
}

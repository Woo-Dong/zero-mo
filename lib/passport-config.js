const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'idname',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, idname, password, done) => {
    try {
      const user = await User.findOne({idname: idname});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', 'Welcome!'));
      }
      return done(null, false, req.flash('danger', 'Invalid id or password'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new FacebookStrategy({
    clientID : '351585988941266',
    clientSecret : 'a73c0735f7bea369f2200658be3e2ac3',
    callbackURL : 'http://localhost:3000/auth/facebook/callback',
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile); // profile 정보로 뭐가 넘어오나 보자.
    try {
      var idname = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(idname, picture, name, profile.name);

      var user = await User.findOne({'facebook.id': profile.id});
      if (!user) {

        if (idaname) {
          user = await User.findOne({idname: idname});
        }
        if (!user) {
          user = new User({name: name});
          user.idname = idname;
        }
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      user.facebook.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));
};
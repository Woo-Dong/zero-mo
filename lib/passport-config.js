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
    // session: true,
    passReqToCallback : true
  }, async (req, idname, password, done) => {
    try {
      const user = await User.findOne({idname: idname});
      if (user){
        if(await user.validPassword(password)){
          console.log("success local-signin");
          return done(null, user, req.flash('success', '로그인 되었습니다.'));
        } 
      }
      return done(null, false, req.flash('danger', 'Invalid id or password'));
    } catch(err) {
      done(err);
    }
  }));

  const callbackURL = (process.env.NODE_ENV == 'production') ?
    'https://zero-mo.herokuapp.com/auth/facebook/callback' :
    'http://localhost:3000/auth/facebook/callback';
  passport.use(new FacebookStrategy({
    clientID : process.env.FBID || '351585988941266',
    clientSecret : process.env.FB_SCRECT || 'a73c0735f7bea369f2200658be3e2ac3',
    callbackURL : callbackURL,
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile); // profile 정보로 뭐가 넘어오나 보자.
    try {
      var idname = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      // console.log(idname, picture, name, profile.name);

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

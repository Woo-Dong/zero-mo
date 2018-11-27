module.exports = (app, passport) => {
    app.get('/signin', (req, res, next) => {
      res.render('signin');
    });
  
    app.post('/signin', passport.authenticate('local-signin', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/signin', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));
  
    app.get('/auth/facebook',
      passport.authenticate('facebook', { scope : 'idname' })
    );
  
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        failureRedirect : '/signin',
        failureFlash : true
      }), (req, res, next) => {
        req.flash('success', '반갑습니다.');
        res.redirect('/');
      }
    );
  
    app.get('/signout', (req, res) => {
      // delete req.session.user;
      req.logout();
      req.flash('success', '성공적으로 로그아웃 되었습니다.');
      res.redirect('/');
    });
  };
  
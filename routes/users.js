var express = require('express'),
    User = require('../models/user');

var router = express.Router();

const crypto = require("crypto");
const catchErrors = require('../lib/async-error');

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

function validateForm(form, options) {
  var name = form.name || "";
  var idname = form.idname || "";
  name = name.trim();
  idname = idname.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!idname) {
    return 'ID is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

router.get('/', needAuth, (req, res, next) => {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/index', {users: users});
  });
   
});


router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.put('/:id', needAuth, (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', 'Not exist user.');
      return res.redirect('back');
    }
    let inputPassword = req.body.current_password;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + user.salt).digest("hex");
    
    if (user.password !== hashPassword) {
      req.flash('danger', 'Password is incorrect');
      return res.redirect('back');
    }

    user.name = req.body.name;
    user.idname = req.body.idname;
    if (req.body.password) {
      let inputPassword = req.body.password;
      let salt = Math.round( new Date().valueOf() * Math.random() ) + "";
      let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
      user.password = hashPassword;
      user.salt = salt;
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Updated successfully.');
      res.redirect('/users');
    });
  });
});

router.delete('/:id', needAuth, (req, res, next) => {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/users');
  });
});

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});

router.post('/', (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({idname: req.body.idname}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', 'ID already exists.');
      return res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      idname: req.body.idname,
    });
    let inputPassword = req.body.password;
    let salt = Math.round( new Date().valueOf() * Math.random() ) + "";
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
    newUser.password = hashPassword;
    newUser.salt = salt;
    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Registered successfully. Please sign in.');
        res.redirect('/signin');
      }
    });
  });
});

module.exports = router;

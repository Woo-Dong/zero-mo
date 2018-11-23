const express = require('express');
const User = require('../models/user');
const router = express.Router();

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

router.get('/admin', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('users/index', {users: users});
}));


router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.find(req.params.id);
  res.render('users/edit', {user: user});
}));


router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }
  if (!await user.validateFormPassword(req.body.current_password)) {
    req.flash('danger', '기존 비밀번호와 다릅니다.');
    return res.redirect('back');
  }

  user.name = req.body.name;
  user.idname = req.body.idname;
  user.isAdmin = req.body.isAdmin;
  user.tel = req.body.tel;

  if (req.body.password) {
    let inputPassword = req.body.password;
    let salt = Math.round( new Date().valueOf() * Math.random() ) + "";
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
    user.password = hashPassword;
    user.salt = salt;
  }

  await user.save();
  req.flash('success', '성공적으로 수정되었습니다.');
  res.redirect('back');
}));


router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = findOneAndRemove({_id: req.params.id});
  req.flash('success', '회원탈퇴하였습니다.');
  res.redirect('/');
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

router.post('/', catchErrors(async (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if(err){
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({idname: req.body.idname});
  if (user) {
    req.flash('danger', 'ID already exists.');
    return res.redirect('back');
  }
  newUser = new User({
    name: req.body.name,
    idname: req.body.idname,
    
  });
  let inputPassword = req.body.password;
  let salt = Math.round( new Date().valueOf() * Math.random() ) + "";
  let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
  newUser.password = hashPassword;
  newUser.salt = salt;
  newUser.tel = req.body.tel;

  await newUser.save();
  req.flash('success', '회원가입이 완료되었습니다! 다시 로그인해주세요.');
  res.redirect('/signin');
}));

module.exports = router;

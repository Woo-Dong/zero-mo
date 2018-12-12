const express = require('express');
const Contest = require('../models/contest');
// const User = require('../models/user'); 
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');
// const Favorite = require('../models/favorite'); 

module.exports = io => {
  const router = express.Router();

  function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
  }
  
  function isAdmin(req, res, next){
    const user = req.user;
    console.log(user.name);
    if(user.isAdmin){
      next();
    } else {
      req.flash('danger', '관리자 권한이 없습니다.');
      res.redirect('/');
    }
  }

  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {commision: {'$regex' : 'open'}};
    const term = req.query.term;
    if (term) {
      query = {$and: [ $or [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {category: {'$regex': term, '$options': 'i'}},
        {company_category: {'$regex': term, '$options': 'i'}}
      ],
      {commision: {'$regex' : 'open'} }]}
    }

    const termCompCat = req.query.termCompCat;
    if(termCompCat) {
      query = {$and: [
        {company_category: {'$regex': termCompCat, '$options': 'i'}},
      {commision: {'$regex' : 'open'} }]}
    }

    const termTarget = req.query.termTarget;
    if(termTarget) {
      query = {$and: [
        {target: {'$regex': termTarget, '$options': 'i'}},
      {commision: {'$regex' : 'open'} }]}
    }

    const termCategory = req.query.termCategory;
    if(termCategory) {
      query = {$and: [
        {category: {'$regex': termCategory, '$options': 'i'}},
      {commision: {'$regex' : 'open'} }]}
    }

    const contests = await Contest.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'author', 
      page: page, limit: limit
    });
    res.render('contests/index', {contests: contests, query: req.query});
  }));

  //=========================================================

  router.get('/manage', needAuth, catchErrors(async (req, res, next) =>  {    //공모전 관리메뉴

    const user = req.user;
    // console.log(user);
    const contests = await Contest.find({author: user.id});
    // console.log(contests);

    res.render('contests/manage', {contests: contests});
  }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('contests/new', {contest: {}});
  });

  //===================================== 관리자 모드

  router.get('/admin', needAuth, isAdmin, catchErrors(async (req, res, next) => {
    const contests = await Contest.find({});
    res.render('contests/admin', {contests: contests});
  }));

  // ===================================================

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);
    const user_validAdmin = req.user;
    res.render('contests/edit', {contest: contest, sessionUser: user_validAdmin});
  }));

  router.get('/:id', needAuth, catchErrors(async (req, res, next) => {
    const user = req.session.user;
    const contest = await Contest.findById(req.params.id).populate('author');
    const comments = await Comment.find({contest: contest.id}).populate('author');
    contest.numView++;   
    await contest.save();
    res.render('contests/show', {user: user, contest: contest, comments: comments});
  }));

  router.put('/:id', catchErrors(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      req.flash('danger', 'Not exist contest');
      return res.redirect('back');
    }
    contest.title = req.body.title;
    contest.content = req.body.content;
    contest.company = req.body.company;
    contest.company_category = req.body.company_category;
    contest.category = req.body.category;
    contest.target = req.body.target;
    contest.start = req.body.start;
    contest.end = req.body.end;
    contest.prize = req.body.prize;
    if(req.body.img){
    contest.img = req.body.img;
    }
    if(req.body.commision){
      contest.commision = req.body.commision;
    }
    console.log("success")
    await contest.save();
    req.flash('success', '성공적으로 수정되었습니다.');
    res.redirect('/contests');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
      await Contest.findOneAndRemove({_id: req.params.id});
      req.flash('success', '성공적으로 삭제하였습니다.');
      res.redirect('/contests');
      // res.redirect('back')

  }));

  router.post('/', needAuth, catchErrors(async (req, res, next) => {

    const user = req.user;

    // if(typeof(req.grecaptcha) != 'undefined') {
    //   if (grecaptcha.getResponse() == "") { 
    //     alert("리캡챠를 체크해야 합니다."); 
    //     return false; 
    //   } else {
    //     return true;
    //   }
    // }

    var contest = new Contest({
      title: req.body.title,
      author: user._id,
      content: req.body.content,
      target: req.body.target,
      company: req.body.company,
      company_category: req.body.company_category,
      category: req.body.category,
      start: req.body.start,
      end: req.body.end,
      prize: req.body.prize
    });
    await contest.save();
    req.flash('success', '등록 신청이 완료되었습니다. 관리자 승인 후 공개될 예정입니다. 감사합니다.');
    res.redirect('/contests');
  }));

  router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      req.flash('danger', 'Not exist contest');
      return res.redirect('back');
    }

    var comment = new Comment({
      author: user._id,
      contest: contest._id,
      content: req.body.content
    });
    await comment.save();
    contest.numComments++;
    await contest.save();


    const url = `/contests/${contest._id}#${comment._id}`;
    io.to(contest.author.toString())
      .emit('answered', {url: url, contest: contest});
    // console.log('SOCKET EMIT', contest.author.toString(), 'commented', {url: url, contest: contest})

    req.flash('success', 'Successfully commented');
    res.redirect(`/contests/${req.params.id}`);
  }));

  return router;
}
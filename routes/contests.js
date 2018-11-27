const express = require('express');
const Contest = require('../models/contest');
// const User = require('../models/user'); 
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');


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

  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {};
    const term = req.query.term;
    if (term) {
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {category: {'$regex': term, '$options': 'i'}},
        {company_category: {'$regex': term, '$options': 'i'}}
      ]};
    }

    const termCompCat = req.query.termCompCat;
    if(termCompCat) {
      query =
        {company_category: {'$regex': termCompCat, '$options': 'i'}};
    }

    const termTarget = req.query.termTarget;
    if(termTarget) {
      query =
        {target: {'$regex': termTarget, '$options': 'i'}};
    }
    const termCategory = req.query.termCategory;
    if(termCategory) {
      query =
        {category: {'$regex': termCategory, '$options': 'i'}};
    }

    const contests = await Contest.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'author', 
      page: page, limit: limit
    });
    res.render('contests/index', {contests: contests, query: req.query});
  }));


  // router.get('/manage', needAuth, catchErrors(async (req, res, next) =>  {    //공모전 관리메뉴

  //   const page = parseInt(req.query.page) || 1;
  //   const limit = parseInt(req.query.limit) || 10;
  //   const user = req.user;
  //   const termMyContest = toString(user);
  //   query = {author : termMyContest };

  //   const contests = await Contest.paginate(query, {
  //     sort: {createdAt: -1}, 
  //     populate: 'author', 
  //     page: page, limit: limit
  //   });

  //   res.render('contests/manage', {contest: contests});
  // }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('contests/new', {contest: {}});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);
    res.render('contests/edit', {contest: contest});
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
    contest.img = req.body.img;
    


    await contest.save();
    req.flash('success', 'Successfully updated');
    res.redirect('/contests');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Contest.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/contests');
  }));

  router.post('/', needAuth, catchErrors(async (req, res, next) => {

    const user = req.user;

    if(typeof(grecaptcha) != 'undefined') {
      if (grecaptcha.getResponse() == "") { 
        alert("리캡챠를 체크해야 합니다."); 
        return false; 
      } else {
        return true;
      }
    }

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
    req.flash('success', 'Successfully posted');
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
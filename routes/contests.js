const express = require('express');
const Contest = require('../models/contest');
const User = require('../models/user'); 
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

function needAuth(req, res, next) {
  if (req.session.user) {
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
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }

  const contests = await Contest.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('contests/index', {contests: contests, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('contests/new', {contest: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  res.render('contests/edit', {contest: contest});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate('author');
  const comments = await Comment.find({contest: contest.id}).populate('author');
  contest.numView++;   
  await contest.save();
  res.render('contests/show', {contest: contest, comments: comments});
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
  contest.target = req.body.target;
  contest.start = req.body.start;
  contest.end = req.body.end;
  contest.prize = req.body.prize;

  // contest.tags = req.body.tags.split(" ").map(e => e.trim());

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
  const user = req.session.user;
  var contest = new Contest({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    target: req.body.target,
    company: req.body.company,
    start: req.body.start,
    end: req.body.end,
    prize: req.body.prize
    // tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await contest.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/contests');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
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

  req.flash('success', 'Successfully commented');
  res.redirect(`/contests/${req.params.id}`);
}));

module.exports = router;

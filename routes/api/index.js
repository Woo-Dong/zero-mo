const express = require('express');
const Contest = require('../../models/contest'); 
const Comment = require('../../models/comment'); 
const Favorite = require('../../models/favorite'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();


router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/contests', require('./contests'));

router.post('/contests/:id/favorite', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return next({status: 404, msg: 'Not exist contest'});
  }
  var favorite = await Favorite.findOne({author: req.user._id, contest: contest._id});
  if (!favorite) {
    contest.numLikes++;
    await Promise.all([
      contest.save(),
      Favorite.create({author: req.user._id, contest: contest._id})
    ]);
  }
  return res.json(contest);
}));

// Like for Answer
router.post('/comments/:id/like', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numLikes++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;

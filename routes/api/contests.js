const express = require('express');
const Contest = require('../../models/contest');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const contests = await Contest.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({contests: contests.docs, page: contests.page, pages: contests.pages});   
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate('author');
  res.json(contest);
}));

router.post('', catchErrors(async (req, res, next) => {
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
    prize: req.body.prize,
    img: req.body.img
  });
  await contest.save();
  res.json(contest)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return next({status: 404, msg: 'Not exist contest'});
  }
  if (contest.author && contest.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
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
  await contest.save();
  res.json(contest);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return next({status: 404, msg: 'Not exist contest'});
  }
  if (contest.author && contest.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Contest.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));

// router.delete('/:id', catchErrors(async (req, res, next) => {
//   const contest = await Contest.findById(req.params.id);
//   if (!contest) {
//     return next({status: 404, msg: 'Not exist contest'});
//   }
//   await Contest.findOneAndRemove({_id: req.params.id});
//   res.json({msg: 'deleted'});
// }));

router.delete('/dislike/:id', catchErrors(async (req, res, next) => {
    
  const favorite = await Favorite.findById(req.params.id);
  // console.log(favorite);
  if (!favorite) {
    return next({status: 404, msg: 'Not exist favorite'});
  }
  
  await Favorite.findOneAndRemove({_id: req.params.id});
  req.flash('success', '즐겨찾기에서 삭제했습니다.');
  res.redirect('/contests/favorite');
}));


module.exports = router;
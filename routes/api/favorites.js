const express = require('express');

const catchErrors = require('../lib/async-error');
const Favorite = require('../models/favorite'); 

const router = express.Router();

//=========================================================


router.get('/',catchErrors(async (req, res, next) =>  {    //공모전 관리메뉴

  const user = req.user;

  const favUser = await Favorite.find({author: user.id}).populate('contest');
  console.log(favUser);

  res.render('contests/favorite', {favorites: favUser});
}));

router.delete('/:id',catchErrors(async (req, res, next) => {
  
  const favorite = await Favorite.findById(req.params.id);
  console.log(favorite);
  if (!favorite) {
    return next({status: 404, msg: 'Not exist favorite'});
  }
  
  await Favorite.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));

//=========================================================
  
module.exports = router;
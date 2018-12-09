const express = require('express');

const catchErrors = require('../lib/async-error');
const Favorite = require('../models/favorite'); 

const router = express.Router();

//=========================================================


router.get('/',catchErrors(async (req, res, next) =>  {    //공모전 관리메뉴

  const user = req.user;

  const favUser = await Favorite.find({author: user.id}).populate('contest');
  console.log(favUser);
  // console.log(favUser.length);
  // console.log("===============");
  // console.log(favUser[0]);
  // console.log("contest Obj: ", favUser[0].contest);

  // const arrContst_id = [];
  // for (i=0; i<favUser.length; i++){
  //   contest_obj = favUser[i].contest._doc;
  //   console.log("_id: ", favUser[i]._id);
  //   console.log("id: ",favUser[i].id);
  //   fav_obj = {id: favUser[i].id};
  //   console.log(fav_obj);
  //   const obj = Object.assign({}, fav_obj, contest_obj);
  //   console.log(obj);
  //   arrContst_id.push(obj);
    
  // }

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
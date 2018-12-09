const express = require('express');
const Contest = require('../models/contest');
const User = require('../models/user');  
const catchErrors = require('../lib/async-error');
const Favorite = require('../models/favorite'); 
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
    //=========================================================
  
  
    router.get('/', needAuth, catchErrors(async (req, res, next) =>  {    //공모전 관리메뉴
  
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
  
    router.delete('/:id/dislike', needAuth, catchErrors(async (req, res, next) => {
      
      const favorite = await Favorite.find({_id: req.params.id});
      console.log(favorite);
      
      await Favorite.findOneAndRemove({_id: favorite});
      req.flash('success', '즐겨찾기에서 삭제했습니다.');
      res.redirect('/favorites');
    }));
  
    //=========================================================
  
    return router;
  }
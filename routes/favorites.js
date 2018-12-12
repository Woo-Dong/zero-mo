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

      res.render('contests/favorite', {favorites: favUser});
    }));
  
    router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
      
      const favorite = await Favorite.find({_id: req.params.id});
      console.log(favorite);
      
      await Favorite.findOneAndRemove({_id: favorite});
      req.flash('success', '즐겨찾기에서 삭제했습니다.');
      res.redirect('/favorites');
    }));
  
    //=========================================================
  
    return router;
  }
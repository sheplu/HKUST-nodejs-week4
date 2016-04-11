var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');
var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({"postedBy": req.decoded._doc._id})
    .populate('postedBy')
    .populate('dishes')
    .exec(function (err, fav) {
        if (err) throw err;
        res.json(fav);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({"postedBy": req.decoded._doc._id})
    .exec(function (err, fav) {
      if(!fav.length) {
        Favorites.create({postedBy: req.decoded._doc._id, dishes: req.body.id}, function (err, fav) {
            if (err) throw err;
            console.log('Favorites created!');
            var id = fav._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the favorite with id: ' + id);
        });
      }
      else {
        var tmp = fav[0].dishes.indexOf(req.body.id);
        if (tmp >= 0) {
          console.log("dup");
          res.json(fav)
        }
        else {
          fav[0].dishes.push(req.body.id);
          fav[0].save(function (err, favo) {
              if (err) throw err;
              console.log('Updated fav!');
              res.json(favo);
          });
        }
      }
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.remove({"postedBy": req.decoded._doc._id}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

favoriteRouter.route('/:favId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({"postedBy": req.decoded._doc._id})
    .exec(function (err, fav) {
        if (err) throw err;
        var tmp = fav[0].dishes.indexOf(req.params.favId);
        console.log(tmp);
        fav[0].dishes.splice(tmp, 1);
        fav[0].save(function (err, favo) {
            if (err) throw err;
            console.log('delete fav!');
            res.json(favo);
        });
    });
});

module.exports = favoriteRouter;

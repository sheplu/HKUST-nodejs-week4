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
        //console.log(fav[0].dishes);

        fav[0].dishes.push(req.body.id);
        fav[0].save(function (err, favo) {
            if (err) throw err;
            console.log('Updated fav!');
            res.json(favo);
        });

      }
    });
    /*

    */
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Leaders.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Leaders.findById(req.params.LeaderId, function (err, leader) {
        if (err) throw err;
        res.json(leader);
    });
});

module.exports = favoriteRouter;

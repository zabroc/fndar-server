'use strict';

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Updates location and return a list of users
 * Expects a json body like {"loc":"52.5398661,13.3922499"}
 * @param req
 * @param res
 */
exports.put = function (req, res) {
    var data = req.body || {};

    if (data.loc && !_validator2.default.isLatLong(data.loc)) {
        return res.status(422).send('Location is not a valid location string.');
    }

    var query = { _id: req.params.userId };
    var newLoc = data.loc.split(",").map(function (item) {
        return item.trim();
    });

    _user2.default.findOneAndUpdate(query, newLoc, { new: false }).then(function (user) {
        if (!user) {
            return res.sendStatus(404);
        }

        _user2.default.find(geoQuery(user)).then(function (localUsers) {
            res.json(userResponse(user, localUsers));
        });
    }).catch(function (err) {
        _logger2.default.error(err);
        res.status(422).send(err.errors);
    });
};

/**
 * Creates a user
 * Expects a json body like {'subject': 'A subject', 'loc': 'lat,long'}
 * @param req
 * @param res
 */
exports.post = function (req, res) {

    var data = req.body || {};

    if (!data.subject) {
        return res.status(422).send('Subject is missing.');
    }

    if (!_validator2.default.isLength(data.subject, { min: 3, max: 200 })) {
        return res.status(422).send('Subject length is invalid.');
    }

    if (data.loc && !_validator2.default.isLatLong(data.loc)) {
        return res.status(422).send('Location is not a valid location string.');
    }

    var user = new _user2.default({
        username: 'generic',
        subject: data.subject,
        loc: data.loc.split(",").map(function (item) {
            return item.trim();
        })
    });

    user.save().then(function (user) {
        res.json(userResponse(user));
    }).catch(function (err) {
        _logger2.default.error(err);
        res.status(500).send(err);
    });
};

exports.delete = function (req, res) {

    _user2.default.remove({ _id: req.params.userId }).then(function (result) {
        if (!result.n) {
            return res.sendStatus(404);
        }
        res.sendStatus(204);
    }).catch(function (err) {
        _logger2.default.error(err);
        res.status(422).send(err.errors);
    });
};

var userResponse = function userResponse(user, localUsers) {

    var filteredLocalUsers = localUsers.map(function (localUser) {
        return {
            id: localUser._id,
            username: localUser.username,
            subject: localUser.subject
        };
    });

    return {
        user: {
            id: user._id,
            username: user.username
        },
        localUsers: filteredLocalUsers
    };
};

var geoQuery = function geoQuery(user) {
    return {
        loc: {
            $geoWithin: {
                $centerSphere: [user.loc, 1 / 6378.1] //1 km radius
            }
        }
    };
};
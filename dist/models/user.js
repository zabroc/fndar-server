'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UserSchema = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseTimestamp = require('mongoose-timestamp');

var _mongooseTimestamp2 = _interopRequireDefault(_mongooseTimestamp);

var _moniker = require('moniker');

var _moniker2 = _interopRequireDefault(_moniker);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import events from '../utils/events';

var UserSchema = exports.UserSchema = new _mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    subject: {
        type: String,
        trim: true,
        default: '',
        required: true
    },
    loc: {
        type: [Number] // [<longitude>, <latitude>]
    }
}, { collection: 'users' });

UserSchema.plugin(_mongooseTimestamp2.default);

//how to index?
UserSchema.index({ loc: '2dsphere' });

UserSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
    }

    //set a fancy user name
    //@todo: check for collisions
    var monikerNames = _moniker2.default.generator([_moniker2.default.adjective, _moniker2.default.noun]);
    this.username = monikerNames.choose();
    _logger2.default.info(this.username);

    next();
});

module.exports = exports = _mongoose2.default.model('User', UserSchema);
import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import Moniker from 'moniker';
import logger from '../utils/logger';
//import events from '../utils/events';

export const UserSchema = new Schema(
    {
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
            type: [Number],  // [<longitude>, <latitude>]
        }
    },
	{ collection: 'users' }
);


UserSchema.plugin(timestamps);

//how to index?
UserSchema.index({ loc: '2dsphere' });


UserSchema.pre('save', function(next) {
    if (!this.isNew) {
        next();
    }

    //set a fancy user name
    //@todo: check for collisions
    const monikerNames = Moniker.generator([Moniker.adjective, Moniker.noun]);
    this.username = monikerNames.choose();

    next();

});

module.exports = exports = mongoose.model('User', UserSchema);

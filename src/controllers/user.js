import async from 'async';
import validator from 'validator';
import User from '../models/user';
import logger from '../utils/logger';


/**
 * Updates location and return a list of users
 * Expects a json body like {"loc":"52.5398661,13.3922499"}
 * @param req
 * @param res
 */
exports.put = (req, res) => {
    const data = req.body || {};

    if (data.loc && !validator.isLatLong(data.loc)) {
        return res.status(422).send('Location is not a valid location string.');
    }

    const query = {_id: req.params.userId};
    const newLoc = data.loc.split(",").map(item => item.trim());


    User.findOneAndUpdate(query, newLoc, {new: false})
        .then(user => {
            if (!user) {
                return res.sendStatus(404);
            }

            User.find(geoQuery(user)).then(localUsers => {
                res.json(userResponse(user, localUsers));
            })
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};


/**
 * Creates a user
 * Expects a json body like {'subject': 'A subject', 'loc': 'lat,long'}
 * @param req
 * @param res
 */
exports.post = (req, res) => {


    const data = req.body || {};

    if (!data.subject) {
        return res.status(422).send('Subject is missing.');
    }

    if (!validator.isLength(data.subject, {min: 3, max: 200})) {
        return res.status(422).send('Subject length is invalid.');
    }

    if (data.loc && !validator.isLatLong(data.loc)) {
        return res.status(422).send('Location is not a valid location string.');
    }

    const user = new User({
            username: 'generic',
            subject: data.subject,
            loc: data.loc.split(",").map(item => item.trim())
        }
    )


    user.save()
        .then(user => {
            res.json(userResponse(user));
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(err);
        });
};

exports.delete = (req, res) => {

    User.remove({_id: req.params.userId})
        .then(result => {
            if (!result.n) {
                return res.sendStatus(404);
            }
            res.sendStatus(204);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};


const userResponse = (user, localUsers) => {

    const filteredLocalUsers = localUsers.map(localUser => (
        {
            id: localUser._id,
            username: localUser.username,
            subject: localUser.subject,
        }
    ));

    return {
        user: {
            id: user._id,
            username: user.username
        },
        localUsers: filteredLocalUsers
    }
}

const geoQuery = (user) => {
    return {
        loc:
            {
                $geoWithin:
                    {
                        $centerSphere: [user.loc, 1 / 6378.1] //1 km radius
                    }
            }
    }
};

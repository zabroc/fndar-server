import config from '../../config';
import logger from '../logger';
import crypto from 'crypto';
import url from 'url';



/**
 * Authorize a user.
 *
 * @return {Function}
 * @api public
 */

export function hmacAuth(req, res) {

    if(typeof req.headers['x-signature'] === 'undefined') {
        let e = new Error('Signature is missing');
        e.name = 'UnauthorizedError';
        throw e;
    }

    const parsedUrl = url.parse(req.url);
    const retrievedSignature = req.headers['x-signature'];
    const computedSignature = crypto.createHmac("sha256", config.auth.secret).update(parsedUrl.path).digest("hex");

    // Compare signatures.
    if (computedSignature !== retrievedSignature) {
        let e = new Error('Signature is invalid');
        e.name = 'UnauthorizedError';
        throw e;
    }

    return true;
}


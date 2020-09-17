'use strict'

const jwy = require('jwt-simple');
const moment = require('moment');

exports.createToken = function(user){

    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwy.encode(payload, 'gHgyqN5RZfg34fsG2WDFCS6743542421992001');
}
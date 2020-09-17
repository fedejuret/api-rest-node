'use strict'

var secret = "gHgyqN5RZfg34fsG2WDFCS6743542421992001";

const jwt = require('jwt-simple');
const moment = require('moment');

exports.authMiddleware = function(req, res, next){

    // Check if athorization is received

    if(!req.headers.authorization) return res.status(200).send({status: 'error', code: 1, message: 'No se encuentra la cabecera de Authorizacion'});

    // Clear token and remove marks
    var token = req.headers.authorization.replace(/['"]+/g, '');

    // decode token
    try{

        var payload = jwt.decode(token, secret);

        // check if token its expired
        if(payload.exp <= moment.unix()){
            return res.status(200).send({status: 'error', code: 2});
        }

    } catch (exception){
        return res.status(200).send({status: 'error', code: 3});
    }

    req.user = payload;

    

    next();
}
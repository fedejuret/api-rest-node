'use strict'

// Requires
const express = require('express');
const bodyParser = require('body-parser');


//Ejecutar Express
const app = express();

// Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_router = require('./routes/comment');

// Middlwares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Routes
// Añadimos '/api' adelante de las rutas 'user_routes'
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_router);

// Exportar modulo
module.exports = app;
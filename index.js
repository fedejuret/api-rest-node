'use strict'

const mongoose = require('mongoose');
const app = require('./app');
var port = process.env.PORT || 3999;

// Activa la opcion de usar promsesas
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true })
		.then(() => {
			console.log("Connected to database MongoDB");

			// Crear el servidor

			app.listen(port, () => {
				console.log(`Server on port ${port}`)
			});
		})
		.catch(error => console.log(error));
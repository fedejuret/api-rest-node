'use strict'

const mongoose = require('mongoose');

// Permite crear esquemas de mongoose
var Schema = mongoose.Schema;

var userSchema = Schema({

    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String


});

userSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;

    return obj;
}

// Exportar Modelo de Mongoose

// Cuando haga un save (Guardar usuario en la base de datos)
// va a crear una collection que se llama 'User' (Si existe, solamente almacena el Esquema)
//                           Collection - Esquema
module.exports = mongoose.model('User', userSchema);
            // Lowercase + plural
            //                  users -> documentos(userSchema)

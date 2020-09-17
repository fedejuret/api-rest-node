'use strict'

const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

//Modelo de comments
var commentsSchema = Schema({
    type: Schema.ObjectId,
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' }

});

var Comment = mongoose.model('Comment', commentsSchema);

// Modelo de topic
var topicSchema = Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' },
    comments: [commentsSchema]
});

// Cargar paginacion al modelo
topicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', topicSchema);
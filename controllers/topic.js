'use strict'

const validator = require('validator');
const Topic = require('../models/topic');

var controller = {

    create: function(req, res){
        // get params

        var params = req.body;

        var title = params.title != null && !validator.isEmpty(params.title);
        var content = params.content != null && !validator.isEmpty(params.content);
        var lang = params.lang != null && !validator.isEmpty(params.lang);

        if(title || content || lang){

            // create object
            var topic = new Topic();

            // assing values

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            // save object
            topic.save((err, topic) => {
                if(err || !topic){
                    return res.status(200).send({message: 'There are an error when try to save topic'});
                }

                return res.status(200).send({message: 'Topic saved!', status: 'success', topic});
            });

        }else{
            return res.status(200).send({message: 'Los datos enviados no son validos'});
        }

    },

    getTopics: function(req, res){

        var page = parseInt(req.params.page);
        if( req.params.page == 0 || req.params.page == '0' || !req.params.page || req.params.page == null || req.params.page == undefined){
            page = 1;
        }

        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };

        Topic.paginate({}, options, (err, topics) => {
            if(err) {
                return res.status(200).send({message: 'There are an error when try to get topics'});
            }

            if(!topics){
                return res.status(200).send({message: 'There are not topics', status: 'error'});
            }

            if(page > topics.totalPages){
                return res.status(200).send({message: 'There are not topics', status: 'error'});
            }

            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });

    },

    // get topics from specific user
    getUserTopics: function(req, res){

        var userId = req.params.userId;

        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err){
                return res.status(500).send({status: 'error', message: 'There are an error when try to get user topics'});
            }

            if(!topics){
                return res.status(404).send({message: 'There are no topics to show'});
            }

            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    },

    // get specific topic
    getTopic: function(req, res){

        var topicId = req.params.topicId;

        Topic.findById(topicId).populate('user').populate('comments.user').exec((err, topic) => {

            // if(err){
            //     return res.status(500).send({
            //         status: 'error',
            //         message: 'There are an error when try to get a topic'
            //     });
            // }

            if(!topic){
                return res.status(200).send({
                    status: 'error',
                    message: 'This topic not exists'
                });
            }

            return res.status(200).send({
                status: 'success',
                topic
            });
        });
    },

    // update topic function
    updateTopic: function(req, res){

        var topicId = req.params.topicId;

        // Get post data
        var params = req.body;

        var title = params.title != null && !validator.isEmpty(params.title);
        var content = params.content != null && !validator.isEmpty(params.content);
        var lang = params.lang != null && !validator.isEmpty(params.lang);

        if(title && content && lang){
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };

            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true} ,(err, updatedTopic) => {

                if(err){
                    return res.status(500).send({message: 'There are an error when try to update topic', status: 'error'});
                }

                if(!updatedTopic){
                    return res.status(200).send({message: 'Cant update topic theme', status: 'error'});
                }

                return res.status(200).send({
                    status: 'success',
                    topic: updatedTopic
                });
            });
        }else{
            return res.status(200).send({message: 'Data validation is not correct'});
        }
    },

    // delete topic function
    delete: function(req, res){

        var topicId = req.params.topicId;

        if(req.user && req.user.role == 'ROLE_ADMIN'){
          Topic.findOneAndDelete({_id: topicId}, (err, removed) => {
              if(err){
                  return res.status(200).send({message: 'There are an error when try to delete topic', status: 'error'});
              }

              return res.status(200).send({
                  status: 'success',
                  message: 'Topic deleted'
              });


          });
        }else{
          Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, removed) => {
              if(err){
                  return res.status(200).send({message: 'There are an error when try to delete topic', status: 'error'});
              }

              return res.status(200).send({
                  status: 'success',
                  message: 'Topic deleted'
              });


          });
        }

    },

    // search topics function
    search: function(req, res){

        // Get string to find from url

        var text = req.params.search;

        if(text || text != null && text.length >= 1){
          Topic.find({ "$or": [
                  {"title": {"$regex": text, "$options": "i"} },
                  {"content": {"$regex": text, "$options": "i"} },
                  {"lang": {"$regex": text, "$options": "i"} },
                  {"code": {"$regex": text, "$options": "i"} }
              ]}).sort([['date', 'descending']]).populate('user').exec((err, topics) => {
                  if(err){
                      return res.status(200).send({
                          status: 'error',
                          message: 'There are an error when try to search topics'
                      });
                  }

                  if(topics.length < 1){
                      return res.status(200).send({
                          status: 'error',
                          message: 'There are no topics to show'
                      });
                  }

                  return res.status(200).send({
                      status: 'success',
                      topics

                  });

          });
        }else{
          return res.status(200).send({
              status: 'error',
              message: 'Introduce un término de búsqueda'
          });
        }

    }
};

module.exports = controller;

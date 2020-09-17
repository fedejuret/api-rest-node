'use strict'

const Topic = require('../models/topic');
const validator = require('validator');

var controller = {

    add: function(req, res){
        var topicId = req.params.topicId;

        // find topic

        Topic.findById(topicId).exec((err, topic) => {
            if(err){
                return res.status(500).send({message: 'Error when try to get topic', status: 'error'});
            }

            if(!topic){
                return res.status(404).send({message: 'Invalid Token', status: 'error'});
            }

            if(req.body.content){
                var content = req.body.content != null && !validator.isEmpty(req.body.content);

                if(content){

                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };

                    topic.comments.push(comment);

                    topic.save((err) => {

                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error when try to opdate topic'
                            });
                        }

                        Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {

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

                    })

                }else{

                    return res.status(200).send({status: 'error', message: 'You need to add a content'});
                }
            }


        });
    },

    update: function(req, res){

        // Get comment Id
        var commentId = req.params.commendId;

        // Get data and validate

        var content = req.body.content != null && !validator.isEmpty(req.body.content);
        if(content){

            // Find and update comment
            Topic.findOneAndUpdate(
                {"comments._id": commentId},
                {
                    "$set": {
                        "comments.$.content": req.body.content
                    }
                },
                {new:true},
                (err, topicUpdated) =>{
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error when try to update comment'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdated
                    });
                });

            // return data

        }else{
            return res.status(200).send({status: 'error', message: 'You need to add a content'});
        }
        

        

    },

    delete: function(req, res){
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        Topic.findById(topicId).populate('user').populate('comments.user').exec((err, topic) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error when try to find comment'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'Error when try to find comment'
                });
            }

            var comment = topic.comments.id(commentId);

            if(comment){
                comment.remove();

                topic.save((err) => {
                	if(err){
                		return res.status(500).send({
		                    status: 'error',
		                    message: 'Error when try to delete topic'
		                });
                	}

                	return res.status(200).send({
                		status: 'success',
                		message: 'The topic has been deleted',
                		topic: topic
                	});
                });
                
            }else{
            	return res.status(404).send({
            		status: 'error',
            		message: 'Comment not exist'
            	});
            }

        })
    }
};

module.exports = controller;
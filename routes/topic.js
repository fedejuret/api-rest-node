'use strict'

const express = require('express');
const TopicController = require('../controllers/topic');

var router = express.Router();

const authMiddleware = require('../middlewares/authenticate');

router.post('/topic', authMiddleware.authMiddleware, TopicController.create);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:userId', TopicController.getUserTopics);
router.get('/topic/:topicId', TopicController.getTopic);
router.put('/topic/:topicId', authMiddleware.authMiddleware, TopicController.updateTopic);
router.delete('/topic/:topicId', authMiddleware.authMiddleware, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router;
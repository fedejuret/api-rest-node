'use strict'

const express = require('express');
const CommentController = require('../controllers/comment');

var router = express.Router();

const authMiddleware = require('../middlewares/authenticate');

router.post('/comment/topic/:topicId', authMiddleware.authMiddleware, CommentController.add);
router.put('/comment/:commendId', authMiddleware.authMiddleware, CommentController.update);
router.delete('/comment/:topicId/:commentId', authMiddleware.authMiddleware, CommentController.delete);


module.exports = router;
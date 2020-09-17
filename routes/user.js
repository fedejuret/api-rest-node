'use strict'

const express = require('express');
const UserController = require('../controllers/user');

var router = express.Router();

const authMiddleware = require('../middlewares/authenticate');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users' });


router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', authMiddleware.authMiddleware, UserController.update);
router.post('/upload-avatar', [authMiddleware.authMiddleware, md_upload] ,UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.getAvatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);
router.post('/password-reset/:userEmail', UserController.sendPasswordReset);
router.delete('/user/:userId', authMiddleware.authMiddleware, UserController.delete);

module.exports = router;

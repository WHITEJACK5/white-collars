const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { isGuest } = require('../shared/auth');
const { rateLimit } = require('../shared/rateLimiter');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts, try again later' });

router.get('/signin', isGuest, controller.getSignIn);
router.post('/signin', authLimiter, controller.postSignIn);

router.get('/signup', isGuest, controller.getSignUp);
router.post('/signup', authLimiter, controller.postSignUp);

router.get('/forgot-password', isGuest, controller.getForgotPassword);
router.post('/forgot-password', authLimiter, controller.postForgotPassword);

router.get('/reset-password/:token', isGuest, controller.getResetPassword);
router.post('/reset-password/:token', authLimiter, controller.postResetPassword);

router.get('/verify-email/:token', controller.verifyEmail);
router.get('/logout', controller.logout);

module.exports = router;

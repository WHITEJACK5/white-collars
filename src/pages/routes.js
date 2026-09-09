const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.home);
router.get('/about', controller.about);
router.get('/contact', controller.contactForm);
router.post('/contact', controller.submitContact);
router.get('/privacy', controller.privacy);
router.get('/terms', controller.terms);
router.get('/careers', controller.careers);

module.exports = router;

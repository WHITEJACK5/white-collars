const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.listCompanies);
router.get('/:slug', controller.getCompanyBySlug);

module.exports = router;

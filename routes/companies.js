const express = require('express');
const router = express.Router();
const Company = require('../models/company');

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true }).sort({ name: 1 }).limit(50);
    res.render('companies', { title: 'Top Companies - WHITE COLLARS', companies });
  } catch (error) {
    console.error('Companies listing error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load companies' });
  }
});

module.exports = router;
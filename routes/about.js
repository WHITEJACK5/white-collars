const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('about', {
    title: 'About Us - WHITE COLLARS'
  });
});

module.exports = router;

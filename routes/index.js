const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Company = require('../models/company');
const Contact = require('../models/contact');

router.get('/', async (req, res) => {
  try {
    const featuredJobs = await Job.find({ active: true, featured: true }).limit(6).sort({ createdAt: -1 });
    const stats = { activeJobSeekers: '50K+', companiesTrustUs: '5K+', jobsPostedMonthly: '25K+', successRate: '95%' };
    res.render('home', { title: 'WHITE COLLARS - Find Your Dream Job', jobs: featuredJobs, stats });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load home page' });
  }
});

router.get('/about', (req, res) => {
  try { res.render('about', { title: 'About Us - WHITE COLLARS' }); }
  catch (error) {
    console.error('About page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load about page' });
  }
});

router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true }).sort({ name: 1 }).limit(50);
    res.render('companies', { title: 'Browse Companies - WHITE COLLARS', companies });
  } catch (error) {
    console.error('Companies page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load companies page' });
  }
});

router.get('/contact', (req, res) => {
  try { res.render('contact', { title: 'Contact Us - WHITE COLLARS' }); }
  catch (error) {
    console.error('Contact page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load contact page' });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      req.flash('error', 'All fields are required');
      return res.redirect('/contact');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('error', 'Please provide a valid email address');
      return res.redirect('/contact');
    }
    console.log('Contact Form Submission:', { name, email, subject, message, timestamp: new Date() });
    const contact = new Contact({ name, email, subject, message, status: 'new' });
    await contact.save();
    req.flash('success', 'Thank you for contacting us! We will get back to you within 24 hours.');
    res.redirect('/contact');
  } catch (error) {
    console.error('Contact form error:', error);
    req.flash('error', 'An error occurred. Please try again later.');
    res.redirect('/contact');
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const { search, location, type } = req.query;
    let query = { active: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) { query.location = { $regex: location, $options: 'i' }; }
    if (type) { query.jobType = type; }
    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(50);
    res.render('jobs', { title: 'Browse Jobs - WHITE COLLARS', jobs, search: search || '', location: location || '', type: type || '' });
  } catch (error) {
    console.error('Jobs page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load jobs page' });
  }
});

router.get('/privacy', (req, res) => {
  try { res.render('privacy', { title: 'Privacy Policy - WHITE COLLARS' }); }
  catch (error) {
    console.error('Privacy page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load privacy policy' });
  }
});

router.get('/terms', (req, res) => {
  try { res.render('terms', { title: 'Terms of Service - WHITE COLLARS' }); }
  catch (error) {
    console.error('Terms page error:', error);
    res.status(500).render('error', { title: 'Error', message: 'Unable to load terms of service' });
  }
});

module.exports = router;
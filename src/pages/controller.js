const jobsService = require('../jobs/service');
const companiesService = require('../companies/service');
const pagesService = require('./service');

exports.home = async (req, res, next) => {
  try {
    const { jobs } = await jobsService.list({ active: true, featured: true }, { limit: 6, skip: 0 });
    const stats = { activeJobSeekers: '50K+', companiesTrustUs: '5K+', jobsPostedMonthly: '25K+', successRate: '95%' };
    res.render('home', { title: 'WHITE COLLARS - Find Your Dream Job', jobs, stats });
  } catch (err) { next(err); }
};

exports.about = (req, res) => res.render('about', { title: 'About Us - WHITE COLLARS' });
exports.privacy = (req, res) => res.render('privacy', { title: 'Privacy Policy - WHITE COLLARS' });
exports.terms = (req, res) => res.render('terms', { title: 'Terms of Service - WHITE COLLARS' });
exports.careers = (req, res) => res.render('careers', { title: 'Careers at WHITE COLLARS' });

exports.contactForm = (req, res) => res.render('contact', { title: 'Contact Us - WHITE COLLARS' });

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      req.flash('error', 'All fields are required');
      return res.redirect('/contact');
    }
    await pagesService.createContact({ firstName: name.split(' ')[0] || name, lastName: name.split(' ').slice(1).join(' ') || '—', email: email.toLowerCase().trim(), subject, message, status: 'new' });
    console.log('Contact submission:', { name, email, subject, timestamp: new Date() });
    req.flash('success', 'Thank you for contacting us! We will get back to you within 24 hours.');
    res.redirect('/contact');
  } catch (err) { next(err); }
};

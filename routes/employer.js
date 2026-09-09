const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { isAuthenticated, isEmployer } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.get('/dashboard', isAuthenticated, isEmployer, employerController.dashboard);
router.get('/jobs/:id/applicants', isAuthenticated, isEmployer, employerController.viewJobApplicants);
router.post('/jobs/:jobId/applicants/:applicantId/status', isAuthenticated, isEmployer, csrfProtection, employerController.updateApplicantStatus);

module.exports = router;

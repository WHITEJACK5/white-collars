const express = require('express');
const router = express.Router();
const controller = require('./employer.controller');
const { isAuthenticated, isEmployer } = require('../shared/auth');

router.get('/dashboard', isAuthenticated, isEmployer, controller.dashboard);
router.get('/jobs/:id/applicants', isAuthenticated, isEmployer, controller.viewJobApplicants);
router.post('/jobs/:jobId/applicants/:applicantId/status', isAuthenticated, isEmployer, controller.updateApplicantStatus);

module.exports = router;

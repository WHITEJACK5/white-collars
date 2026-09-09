const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated, isEmployer } = require('../middleware/auth');
const { validateJob, handleValidationErrors } = require('../middleware/validation');
const { csrfProtection } = require('../middleware/csrf');
const { upload, handleUploadError } = require('../middleware/upload'); // wrapper around multer

// Public
router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJobById);

// Employer: create
router.get('/new/post', isAuthenticated, isEmployer, jobController.showCreateForm);
router.post('/', isAuthenticated, isEmployer, csrfProtection, validateJob, handleValidationErrors, jobController.createJob);

// Employer: edit/update/delete (PUT via method-override)
router.get('/:id/edit', isAuthenticated, isEmployer, jobController.showEditForm);
router.put('/:id', isAuthenticated, isEmployer, csrfProtection, jobController.updateJob);
router.delete('/:id', isAuthenticated, isEmployer, csrfProtection, jobController.deleteJob);

// Apply (jobseeker) — supports resume upload + future video
router.post('/:id/apply', isAuthenticated, csrfProtection, upload.single('resume'), handleUploadError, jobController.applyForJob);

module.exports = router;

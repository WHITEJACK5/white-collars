const express = require('express');
const router = express.Router();
const jobController = require('./controller');
const { isAuthenticated, isEmployer } = require('../shared/auth');
const { validateJob, handleValidationErrors } = require('../shared/validation');
const { upload, handleUploadError } = require('../shared/upload');

router.get('/', jobController.listJobs);
router.get('/new/post', isAuthenticated, isEmployer, jobController.showCreateForm);
router.get('/:id', jobController.getJobById);
router.get('/:id/edit', isAuthenticated, isEmployer, jobController.showEditForm);

router.post('/', isAuthenticated, isEmployer, validateJob, handleValidationErrors, jobController.createJob);
router.put('/:id', isAuthenticated, isEmployer, jobController.updateJob);
router.delete('/:id', isAuthenticated, isEmployer, jobController.deleteJob);
router.post('/:id/apply', isAuthenticated, upload.single('resume'), handleUploadError, jobController.applyForJob);

module.exports = router;

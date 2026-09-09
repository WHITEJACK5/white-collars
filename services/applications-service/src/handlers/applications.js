const Application = require('../domain/application.model');
const jobsClient = require('../clients/jobs.client');

exports.create = async (req, res, next) => {
  try {
    const { jobId, userId, coverLetter } = req.body;
    // Validate job exists via network, not import
    const job = await jobsClient.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (new Date(job.applicationDeadline) < new Date()) return res.status(400).json({ error: 'Deadline passed' });
    const app = await Application.create({ job: jobId, user: userId, coverLetter });
    res.status(201).json(app);
  } catch (err) { next(err); }
};
exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.jobId) filter.job = req.query.jobId;
    if (req.query.userId) filter.user = req.query.userId;
    const apps = await Application.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ applications: apps });
  } catch (err) { next(err); }
};
exports.getById = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json(app);
  } catch (err) { next(err); }
};
exports.updateStatus = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    const updated = await app.updateStatus(req.body.status, req.headers['x-user-id'], req.body.note);
    res.json(updated);
  } catch (err) { next(err); }
};
exports.uploadVideo = async (req, res) => res.json({ message: 'video upload stub — wire S3 in prod' });

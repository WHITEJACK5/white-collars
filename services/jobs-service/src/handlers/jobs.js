const Job = require('../domain/job.model');

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const filter = { active: true };
    if (req.query.title) filter.$text = { $search: req.query.title };
    if (req.query.postedBy) filter.postedBy = req.query.postedBy;
    const [jobs, total] = await Promise.all([Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Job.countDocuments(filter)]);
    res.json({ jobs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};
exports.getById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('companyRef');
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json(job);
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.headers['x-user-id'] || req.body.postedBy });
    res.status(201).json(job);
  } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    job.active = false; await job.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
};

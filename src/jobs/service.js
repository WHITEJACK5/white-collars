// src/jobs/service.js — ONLY file in jobs/ allowed to touch Job model
const Job = require('./model');

function parsePagination(query, defaults = { page: 1, limit: 12 }) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = defaults.page;
  if (!Number.isFinite(limit) || limit < 1 || limit > 50) limit = defaults.limit;
  return { page, limit, skip: (page - 1) * limit };
}

exports.parsePagination = parsePagination;

exports.list = async (filter, { page, limit, skip, sort = { createdAt: -1 } } = {}) => {
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip || 0).limit(limit || 50).populate('companyRef', 'name logo industry').populate('postedBy', 'name email'),
    Job.countDocuments(filter),
  ]);
  return { jobs, total };
};

exports.getById = (id) => Job.findById(id).populate('companyRef').populate('postedBy', 'name email');
exports.getByIdWithApplicants = (id) => Job.findById(id).populate('applicants.user', 'name email userType').populate('companyRef', 'name');
exports.create = (data) => Job.create(data);
exports.update = (id, updates) => Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
exports.archive = async (id) => {
  const job = await Job.findById(id);
  if (!job) return null;
  job.active = false;
  await job.save();
  return job;
};
exports.incrementViews = (job) => job.incrementViews().catch(() => {});
exports.countByPostedBy = (userId) => Job.countDocuments({ postedBy: userId });
exports.findByPostedBy = (userId) => Job.find({ postedBy: userId }).sort({ createdAt: -1 }).populate('companyRef', 'name logo');

exports._model = Job;

// src/applications/service.js — ONLY file in applications/ allowed to touch Application model
const Application = require('./model');

exports.create = (data) => Application.create(data);
exports.findByJobAndUser = (jobId, userId) => Application.findOne({ job: jobId, user: userId });
exports.findByUser = (userId) => Application.find({ user: userId }).populate('job', 'title company location').sort({ createdAt: -1 });
exports.findByJob = (jobId) => Application.find({ job: jobId }).populate('user', 'name email').sort({ createdAt: -1 });
exports.updateStatus = async (appId, status, changedBy, note) => {
  const app = await Application.findById(appId);
  if (!app) return null;
  return app.updateStatus(status, changedBy, note);
};

exports._model = Application;

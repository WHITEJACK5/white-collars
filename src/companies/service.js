// src/companies/service.js — ONLY file in companies/ allowed to touch Company model
const Company = require('./model');

exports.listActive = (filter = {}, { skip, limit } = {}) => {
  const q = { isActive: true, ...filter };
  let query = Company.find(q).sort({ name: 1 });
  if (typeof skip === 'number') query = query.skip(skip);
  if (typeof limit === 'number') query = query.limit(limit);
  return query;
};

exports.countActive = (filter = {}) => Company.countDocuments({ isActive: true, ...filter });
exports.getById = (id) => Company.findById(id);
exports.getBySlug = (slug) => Company.findOne({ slug, isActive: true });
exports.create = (data) => Company.create(data);

exports._model = Company;

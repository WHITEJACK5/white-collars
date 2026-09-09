const Company = require('../domain/company.model');

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([Company.find({ isActive: true }).sort({ name: 1 }).skip(skip).limit(limit), Company.countDocuments({ isActive: true })]);
    res.json({ companies, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};
exports.getBySlug = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true });
    if (!company) return res.status(404).json({ error: 'Not found' });
    res.json(company);
  } catch (err) { next(err); }
};

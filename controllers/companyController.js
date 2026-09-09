const Company = require('../models/company');

function parsePagination(req, defaults = { page: 1, limit: 12 }) {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = defaults.page;
  if (!Number.isFinite(limit) || limit < 1 || limit > 50) limit = defaults.limit;
  return { page, limit, skip: (page - 1) * limit };
}

exports.listCompanies = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [companies, total] = await Promise.all([
      Company.find({ isActive: true }).sort({ name: 1 }).skip(skip).limit(limit),
      Company.countDocuments({ isActive: true }),
    ]);
    const totalPages = Math.ceil(total / limit);
    res.render('companies', {
      title: 'Top Companies - WHITE COLLARS',
      companies,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    });
  } catch (err) { next(err); }
};

exports.getCompanyBySlug = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true });
    if (!company) return res.status(404).render('404', { title: '404 - Company Not Found' });
    res.render('company-detail', { title: `${company.name} - WHITE COLLARS`, company });
  } catch (err) { next(err); }
};

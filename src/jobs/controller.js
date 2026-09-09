const jobsService = require('./service');
const companiesService = require('../companies/service');

exports.listJobs = async (req, res, next) => {
  try {
    const { title, location, category, type } = req.query;
    const { page, limit, skip } = jobsService.parsePagination(req);
    const filter = { active: true };
    if (title) filter.$text = { $search: title };
    if (location) filter.location = new RegExp(location, 'i');
    if (category) filter.category = category;
    if (type) filter.employmentType = type;

    const { jobs, total } = await jobsService.list(filter, { page, limit, skip });
    const categories = ['Software Development','Design & UI/UX','Data & Analytics','Cybersecurity','Finance & Accounting','Mobile Development','Engineering (Core)','Marketing & Sales','Operations & Supply Chain','Human Resources','Product Management','Consulting','Other'];
    const totalPages = Math.ceil(total / limit);
    res.render('jobs', {
      title: 'Browse Jobs - WHITE COLLARS',
      jobs,
      categories,
      filters: { title, location, category, type },
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
    });
  } catch (err) { next(err); }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await jobsService.getById(req.params.id);
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    jobsService.incrementViews(job);
    const related = await jobsService._model.find({ category: job.category, _id: { $ne: job._id }, active: true }).limit(3).populate('companyRef', 'name logo');
    res.render('job-detail', { title: `${job.title} - ${job.company}`, job, relatedJobs: related });
  } catch (err) { next(err); }
};

exports.showCreateForm = async (req, res, next) => {
  try {
    const companies = await companiesService.listActive({}, {});
    res.render('jobs-form', { title: 'Post a Job - WHITE COLLARS', job: null, companies, formAction: '/jobs', formMethod: 'POST' });
  } catch (err) { next(err); }
};

exports.createJob = async (req, res, next) => {
  try {
    const { title, company, companyRef, department, location, locationType, description, category, employmentType, experienceLevel, salaryMin, salaryMax, salaryCurrency, tags } = req.body;
    const job = await jobsService.create({
      title: title.trim(),
      company: company.trim(),
      companyRef: companyRef || undefined,
      department: department.trim(),
      location: location.trim(),
      locationType: locationType || 'On-site',
      description: description.trim(),
      category,
      employmentType: employmentType || 'Full-time',
      experienceLevel: experienceLevel || 'Mid Level',
      salary: { min: salaryMin ? Number(salaryMin) : undefined, max: salaryMax ? Number(salaryMax) : undefined, currency: salaryCurrency || 'INR' },
      tags: tags ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
      postedBy: req.session.user.id,
    });
    req.flash('success', 'Job posted successfully');
    res.redirect(`/jobs/${job._id}`);
  } catch (err) { next(err); }
};

exports.showEditForm = async (req, res, next) => {
  try {
    const job = await jobsService.getById(req.params.id);
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    if (String(job.postedBy) !== String(req.session.user.id) && String(job.postedBy._id || job.postedBy) !== String(req.session.user.id)) {
      req.flash('error', 'You can only edit your own postings');
      return res.redirect(`/jobs/${job._id}`);
    }
    const companies = await companiesService.listActive({}, {});
    res.render('jobs-form', { title: `Edit ${job.title} - WHITE COLLARS`, job, companies, formAction: `/jobs/${job._id}?_method=PUT`, formMethod: 'POST' });
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await jobsService.getById(req.params.id);
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    const ownerId = String(job.postedBy._id || job.postedBy);
    if (ownerId !== String(req.session.user.id)) {
      req.flash('error', 'Not authorized');
      return res.redirect(`/jobs/${job._id}`);
    }
    const allowed = ['title','company','companyRef','department','location','locationType','description','category','employmentType','experienceLevel','active','featured'];
    for (const k of allowed) if (req.body[k] !== undefined) job[k] = req.body[k];
    if (req.body.salaryMin !== undefined) job.salary.min = req.body.salaryMin ? Number(req.body.salaryMin) : undefined;
    if (req.body.salaryMax !== undefined) job.salary.max = req.body.salaryMax ? Number(req.body.salaryMax) : undefined;
    await job.save();
    req.flash('success', 'Job updated');
    res.redirect(`/jobs/${job._id}`);
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await jobsService.getById(req.params.id);
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    const ownerId = String(job.postedBy._id || job.postedBy);
    if (ownerId !== String(req.session.user.id)) {
      req.flash('error', 'Not authorized');
      return res.redirect(`/jobs/${job._id}`);
    }
    job.active = false;
    await job.save();
    req.flash('success', 'Job archived');
    res.redirect('/employer/dashboard');
  } catch (err) { next(err); }
};

exports.applyForJob = async (req, res, next) => {
  try {
    if (!req.session.user) {
      req.flash('error', 'Please sign in to apply');
      return res.redirect('/auth/signin');
    }
    const job = await jobsService.getById(req.params.id);
    if (!job) {
      req.flash('error', 'Job not found');
      return res.redirect('/jobs');
    }
    if (job.isExpired) {
      req.flash('error', 'Application deadline has passed');
      return res.redirect(`/jobs/${job._id}`);
    }
    const already = job.applicants.some((a) => String(a.user) === String(req.session.user.id) || String(a.user?._id) === String(req.session.user.id));
    if (already) {
      req.flash('error', 'You have already applied for this job');
      return res.redirect(`/jobs/${job._id}`);
    }
    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : undefined;
    job.applicants.push({
      user: req.session.user.id,
      appliedAt: Date.now(),
      status: 'pending',
      resume: resumePath,
      coverLetter: req.body.coverLetter,
    });
    await job.save();
    // Also mirror to applications service if needed
    try {
      const appsService = require('../applications/service');
      await appsService.create({ job: job._id, user: req.session.user.id, coverLetter: req.body.coverLetter, resume: resumePath ? { filename: req.file.filename, path: resumePath } : undefined });
    } catch {}
    req.flash('success', 'Application submitted successfully!');
    res.redirect(`/jobs/${job._id}`);
  } catch (err) { next(err); }
};

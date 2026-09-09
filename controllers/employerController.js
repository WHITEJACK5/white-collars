const Job = require('../models/job');
const Application = require('../models/Application');

exports.dashboard = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const [jobs, totalApplicants] = await Promise.all([
      Job.find({ postedBy: userId }).sort({ createdAt: -1 }).populate('companyRef', 'name logo'),
      Job.aggregate([
        { $match: { postedBy: req.session.user.id ? require('mongoose').Types.ObjectId.createFromHexString(req.session.user.id) : null } },
        { $unwind: '$applicants' },
        { $count: 'total' },
      ]).catch(() => [{ total: 0 }]),
    ]);
    // fallback count if aggregate fails due to ObjectId handling
    let applicantCount = 0;
    if (jobs.length) applicantCount = jobs.reduce((sum, j) => sum + (j.applicants ? j.applicants.length : 0), 0);

    res.render('employer-dashboard', {
      title: 'Employer Dashboard - WHITE COLLARS',
      jobs,
      stats: { totalJobs: jobs.length, totalApplicants: applicantCount },
    });
  } catch (err) { next(err); }
};

exports.viewJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicants.user', 'name email userType').populate('companyRef', 'name');
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    if (String(job.postedBy) !== String(req.session.user.id)) {
      req.flash('error', 'Not authorized to view applicants for this job');
      return res.redirect('/employer/dashboard');
    }
    res.render('job-applicants', { title: `Applicants — ${job.title}`, job });
  } catch (err) { next(err); }
};

exports.updateApplicantStatus = async (req, res, next) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status, note } = req.body;
    const allowed = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!allowed.includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect('back');
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).render('404', { title: '404 - Job Not Found' });
    if (String(job.postedBy) !== String(req.session.user.id)) {
      req.flash('error', 'Not authorized');
      return res.redirect('/employer/dashboard');
    }
    const applicant = job.applicants.id(applicantId);
    if (!applicant) {
      req.flash('error', 'Applicant not found');
      return res.redirect('back');
    }
    applicant.status = status;
    await job.save();
    // Also update standalone Application collection if exists
    try {
      await Application.findOneAndUpdate({ job: jobId, user: applicant.user }, { status, $push: { statusHistory: { status, changedBy: req.session.user.id, note } } });
    } catch {}
    req.flash('success', `Applicant marked as ${status}`);
    res.redirect('back');
  } catch (err) { next(err); }
};

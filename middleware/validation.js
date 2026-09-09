const { body, validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((e) => e.msg);
    req.flash('error', msgs.join(', '));
    req.session.formData = req.body;
    return res.redirect('back');
  }
  delete req.session.formData;
  next();
};

// Password rule: min 8, max 128, must contain upper, lower, digit. Symbol strongly recommended but not strictly required for UX.
const passwordChecks = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password should contain a symbol for stronger security'),
];

// For signup we want strict: fail if missing symbol? Provide separate strict validator.
exports.validateSignUp = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number')
    .custom((val) => {
      if (!/[^A-Za-z0-9]/.test(val)) throw new Error('Password must contain a symbol (e.g. !@#$%)');
      return true;
    }),
  body('userType').notEmpty().withMessage('Account type is required').isIn(['jobseeker', 'employer']).withMessage('Invalid account type'),
];

exports.validateSignIn = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['jobseeker', 'employer', 'admin']).withMessage('Invalid account type'),
  body('userType').optional().isIn(['jobseeker', 'employer']).withMessage('Invalid account type'),
];

exports.validateJob = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ min: 5, max: 100 }).withMessage('Job title must be 5-100 characters'),
  body('company').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().notEmpty().withMessage('Job description is required').isLength({ min: 50, max: 5000 }).withMessage('Description must be 50-5000 characters'),
  body('category').notEmpty().withMessage('Job category is required'),
  body('employmentType').notEmpty().withMessage('Employment type is required').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']).withMessage('Invalid employment type'),
];

exports.validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().matches(/^[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
];

exports.validateCompany = [
  body('name').trim().notEmpty().withMessage('Company name is required').isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('employees').notEmpty().withMessage('Employee count is required').isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000-5000', '5000-10000', '10000+']).withMessage('Invalid employee range'),
  body('website').optional().trim().isURL().withMessage('Please provide a valid URL'),
];

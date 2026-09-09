const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [5, 'Job title must be at least 5 characters'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  companyRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  locationType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot exceed 200 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each responsibility cannot exceed 200 characters']
  }],
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'Software Development',
      'Design & UI/UX',
      'Data & Analytics',
      'Cybersecurity',
      'Finance & Accounting',
      'Mobile Development',
      'Engineering (Core)',
      'Marketing & Sales',
      'Operations & Supply Chain',
      'Human Resources',
      'Product Management',
      'Consulting',
      'Other'
    ]
  },
  employmentType: {
    type: String,
    enum: {
      values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
      message: 'Invalid employment type'
    },
    default: 'Full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    default: 'Mid Level'
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    period: {
      type: String,
      enum: ['Hourly', 'Monthly', 'Yearly'],
      default: 'Yearly'
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  educationRequired: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    },
    coverLetter: String,
    resume: String
  }],
  applicationDeadline: {
    type: Date
  },
  numberOfPositions: {
    type: Number,
    default: 1,
    min: [1, 'Number of positions must be at least 1']
  },
  views: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better search performance
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ active: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ featured: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applicants ? this.applicants.length : 0;
});

// Virtual to check if deadline has passed
jobSchema.virtual('isExpired').get(function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Method to increment view count
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to find active jobs
jobSchema.statics.findActive = function() {
  return this.find({ active: true, isExpired: false }).sort({ createdAt: -1 });
};

// Pre-save middleware to validate salary range
jobSchema.pre('save', function(next) {
  if (this.salary && this.salary.min && this.salary.max) {
    if (this.salary.min > this.salary.max) {
      next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    filename: String,
    path: String,
    uploadDate: Date
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'reviewed', 'shortlisted', 'interview-scheduled', 'rejected', 'accepted', 'withdrawn'],
      message: 'Invalid application status'
    },
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }],
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person']
    },
    notes: String
  },
  withdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,
  withdrawnReason: String
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ job: 1, user: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ user: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, changedBy, note) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    note
  });
  return this.save();
};

// Method to withdraw application
applicationSchema.methods.withdraw = function(reason) {
  this.withdrawn = true;
  this.withdrawnAt = Date.now();
  this.withdrawnReason = reason;
  this.status = 'withdrawn';
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);

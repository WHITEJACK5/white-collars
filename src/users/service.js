// src/users/service.js — ONLY file in users/ allowed to touch the User model
// Other features must call these functions, not require('../users/model')
const User = require('./model');

exports.findById = (id) => User.findById(id);
exports.findByIdWithPassword = (id) => User.findById(id).select('+password');
exports.findByEmail = (email) => User.findOne({ email: email.toLowerCase().trim() });
exports.findByEmailWithPassword = (email) => User.findOne({ email: email.toLowerCase().trim() }).select('+password');
exports.findByResetToken = (hashed) => User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
exports.findByVerifyToken = (hashed) => User.findOne({ emailVerifyToken: hashed, emailVerifyExpires: { $gt: Date.now() } });
exports.createUser = (data) => User.create(data); // hashing via pre-save hook
exports.count = () => User.countDocuments();

// Expose model only for advanced queries that still need discipline review
exports._model = User;

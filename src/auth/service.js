// src/auth/service.js — orchestrates users/service, does not touch User model directly
const crypto = require('crypto');
const usersService = require('../users/service');

exports.authenticate = async (email, password) => {
  const user = await usersService.findByEmailWithPassword(email);
  if (!user || !user.isActive) return null;
  const valid = await user.comparePassword(password);
  if (!valid) return null;
  return user;
};

exports.register = async ({ name, email, password, userType }) => {
  const existing = await usersService.findByEmail(email);
  if (existing) throw Object.assign(new Error('Email already exists'), { code: 11000 });
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const user = await usersService.createUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    userType,
    emailVerifyToken: crypto.createHash('sha256').update(verifyToken).digest('hex'),
    emailVerifyExpires: Date.now() + 1000 * 60 * 60 * 24,
  });
  return { user, verifyToken };
};

exports.generatePasswordReset = async (email) => {
  const user = await usersService.findByEmail(email);
  if (!user) return null; // do not reveal existence
  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60;
  await user.save({ validateBeforeSave: false });
  return { user, token };
};

exports.resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await usersService._model.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } }).select('+password');
  if (!user) return null;
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return user;
};

exports.verifyEmail = async (token) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await usersService.findByVerifyToken(hashed);
  if (!user) return null;
  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return user;
};

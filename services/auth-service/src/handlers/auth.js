const usersClient = require('../clients/users.client');

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersClient.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await usersClient.verifyPassword(user.id, password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    // In real deploy, create session/JWT here
    res.json({ user: { id: user.id, email: user.email, userType: user.userType } });
  } catch (err) { next(err); }
};

exports.signup = async (req, res, next) => {
  try {
    const user = await usersClient.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res) => res.json({ message: 'If account exists, email sent' });
exports.resetPassword = async (req, res) => res.json({ message: 'Password reset (stub)' });
exports.verifyEmail = async (req, res) => res.json({ message: 'Verified (stub)' });

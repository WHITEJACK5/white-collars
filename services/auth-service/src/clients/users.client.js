// Never import users-service code — only call its HTTP contract
const USERS_URL = process.env.USERS_SERVICE_URL || 'http://users-service:3001';

async function findByEmail(email) {
  const res = await fetch(`${USERS_URL}/users?email=${encodeURIComponent(email)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`users-service error ${res.status}`);
  return res.json();
}

async function createUser(data) {
  const res = await fetch(`${USERS_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`users-service create failed ${res.status}`);
  return res.json();
}

async function verifyPassword(userId, password) {
  const res = await fetch(`${USERS_URL}/users/${userId}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const body = await res.json();
  return body.valid;
}

module.exports = { findByEmail, createUser, verifyPassword };

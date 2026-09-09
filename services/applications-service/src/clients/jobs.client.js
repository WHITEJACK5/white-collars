const JOBS_URL = process.env.JOBS_SERVICE_URL || 'http://jobs-service:3003';
exports.getJob = async (id) => {
  const res = await fetch(`${JOBS_URL}/jobs/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`jobs-service ${res.status}`);
  return res.json();
};

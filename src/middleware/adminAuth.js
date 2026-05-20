function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const secret = process.env.ADMIN_SECRET_TOKEN;

  if (!secret) {
    return res.status(503).json({ error: 'Admin endpoint not configured' });
  }
  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  next();
}

module.exports = { adminAuth };

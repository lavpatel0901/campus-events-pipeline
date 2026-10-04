const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(req, res, next) {
   const header = req.headers.authorization || '';
   const token = header.startsWith('Bearer ') ? header.slice(7) : null;
   if (!token) {
      return res.status(401).json({ error: 'Login required' });
   }
   try {
      req.user = jwt.verify(token, config.jwtSecret);
      next();
   } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
   }
}

function requireAdmin(req, res, next) {
   if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
   }
   next();
}

module.exports = { authenticate, requireAdmin };
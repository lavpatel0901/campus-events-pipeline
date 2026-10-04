const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config');
const httpError = require('../utils/httpError');

async function register(name, email, password) {
   const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
   if (existing.rows.length > 0) {
      throw httpError(409, 'Email already registered');
   }
   const hash = await bcrypt.hash(password, 10);
   const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hash, 'student']
   );
   return result.rows[0];
}

async function login(email, password) {
   const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
   const user = result.rows[0];
   const passwordMatches = user && (await bcrypt.compare(password, user.password_hash));
   if (!passwordMatches) {
      throw httpError(401, 'Invalid email or password');
   }
   return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
}

async function seedAdmin(email, password) {
   if (!email || !password) {
      return;
   }
   const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
   if (existing.rows.length > 0) {
      return;
   }
   const hash = await bcrypt.hash(password, 10);
   await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Admin', email, hash, 'admin']
   );
}

module.exports = { register, login, seedAdmin };
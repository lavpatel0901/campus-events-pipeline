const userService = require('../services/userService');
const metrics = require('../config/metrics');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const validators = require('../utils/validators');

const register = asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;
   if (!validators.isNonEmpty(name)) throw httpError(400, 'Name must be at least 3 characters');
   if (!validators.isValidEmail(email)) throw httpError(400, 'Email is not valid');
   if (!validators.isStrongPassword(password)) throw httpError(400, 'Password must be at least 8 characters');

   const user = await userService.register(name, email, password);
   res.status(201).json(user);
});

const login = asyncHandler(async (req, res) => {
   const { email, password } = req.body;
   if (!validators.isValidEmail(email) || typeof password !== 'string') {
      throw httpError(400, 'Email and password are required');
   }
   try {
      const token = await userService.login(email, password);
      res.json({ token });
   } catch (err) {
      if (err.status === 401) {
         metrics.failedLoginsTotal.inc();
      }
      throw err;
   }
});

module.exports = { register, login };
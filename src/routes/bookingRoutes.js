const express = require('express');
const controller = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.post('/', controller.book);
router.get('/me', controller.mine);
router.delete('/:id', controller.cancel);

module.exports = router;
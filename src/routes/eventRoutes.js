const express = require('express');
const controller = require('../controllers/eventController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
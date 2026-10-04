const express = require('express');
const db = require('../config/db');
const metrics = require('../config/metrics');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
   try {
      await db.query('SELECT 1');
      res.json({ status: 'ok' });
   } catch (err) {
      res.status(503).json({ status: 'database unavailable' });
   }
}));

router.get('/metrics', asyncHandler(async (req, res) => {
   res.set('Content-Type', metrics.client.register.contentType);
   res.send(await metrics.client.register.metrics());
}));

// This endpoint fails on purpose, so I can test the monitoring alerts later
router.get('/error', (req, res) => {
   res.status(500).json({ error: 'Simulated failure for alert testing' });
});

module.exports = router;
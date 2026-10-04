const metrics = require('../config/metrics');

function metricsMiddleware(req, res, next) {
   const stopTimer = metrics.httpRequestDuration.startTimer();
   res.on('finish', () => {
      const route = req.route ? req.baseUrl + req.route.path : 'unmatched';
      const labels = { method: req.method, route, status: res.statusCode };
      metrics.httpRequestsTotal.inc(labels);
      stopTimer(labels);
   });
   next();
}

module.exports = metricsMiddleware;
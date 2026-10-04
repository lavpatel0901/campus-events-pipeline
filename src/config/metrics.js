const client = require('prom-client');

// First I collect the default Node.js metrics
client.collectDefaultMetrics();

// Then I add my own metrics
const httpRequestsTotal = new client.Counter({
   name: 'http_requests_total',
   help: 'Total HTTP requests',
   labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
   name: 'http_request_duration_seconds',
   help: 'HTTP request duration in seconds',
   labelNames: ['method', 'route', 'status'],
   buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

const bookingsTotal = new client.Counter({
   name: 'bookings_total',
   help: 'Total successful bookings'
});

const failedLoginsTotal = new client.Counter({
   name: 'failed_logins_total',
   help: 'Total failed login attempts'
});

module.exports = { client, httpRequestsTotal, httpRequestDuration, bookingsTotal, failedLoginsTotal };
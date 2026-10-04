const app = require('./app');
const config = require('./config');
const db = require('./config/db');
const userService = require('./services/userService');

async function start() {
   await db.initSchema();
   await userService.seedAdmin(config.adminEmail, config.adminPassword);
   app.listen(config.port, () => console.log('CampusEvents API running on port ' + config.port));
}

start().catch((err) => {
   console.error('Failed to start the server', err);
   process.exit(1);
});
const { Pool } = require('pg');
const config = require('./index');
const schema = require('./schema');

const pool = new Pool({ connectionString: config.databaseUrl });

function query(text, params) {
   return pool.query(text, params);
}

// First I create the tables if they do not exist
async function initSchema() {
   for (const statement of schema) {
      await pool.query(statement);
   }
}

module.exports = { query, initSchema };
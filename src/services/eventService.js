const db = require('../config/db');
const httpError = require('../utils/httpError');

async function listEvents() {
   const result = await db.query('SELECT * FROM events ORDER BY event_date');
   return result.rows;
}

async function getEvent(id) {
   const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
   const event = result.rows[0];
   if (!event) {
      throw httpError(404, 'Event not found');
   }
   const count = await db.query('SELECT COUNT(*) AS count FROM bookings WHERE event_id = $1', [id]);
   return { ...event, seats_left: event.capacity - Number(count.rows[0].count) };
}

async function createEvent(data) {
   const result = await db.query(
      'INSERT INTO events (title, location, event_date, capacity) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.title, data.location, data.event_date, data.capacity]
   );
   return result.rows[0];
}

async function updateEvent(id, data) {
   await getEvent(id);
   const result = await db.query(
      'UPDATE events SET title = $1, location = $2, event_date = $3, capacity = $4 WHERE id = $5 RETURNING *',
      [data.title, data.location, data.event_date, data.capacity, id]
   );
   return result.rows[0];
}

async function deleteEvent(id) {
   await getEvent(id);
   await db.query('DELETE FROM events WHERE id = $1', [id]);
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };
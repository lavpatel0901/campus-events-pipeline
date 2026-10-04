const db = require('../config/db');
const httpError = require('../utils/httpError');

async function bookSeat(userId, eventId) {
   const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
   const event = eventResult.rows[0];
   if (!event) {
      throw httpError(404, 'Event not found');
   }

   const duplicate = await db.query(
      'SELECT id FROM bookings WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
   );
   if (duplicate.rows.length > 0) {
      throw httpError(409, 'You have already booked this event');
   }

   const count = await db.query('SELECT COUNT(*) AS count FROM bookings WHERE event_id = $1', [eventId]);
   if (Number(count.rows[0].count) >= event.capacity) {
      throw httpError(409, 'This event is full');
   }

   const result = await db.query(
      'INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING id, user_id, event_id',
      [userId, eventId]
   );
   return result.rows[0];
}

async function listMyBookings(userId) {
   const result = await db.query(
      'SELECT b.id, b.event_id, e.title, e.event_date FROM bookings b JOIN events e ON e.id = b.event_id WHERE b.user_id = $1',
      [userId]
   );
   return result.rows;
}

async function cancelBooking(userId, bookingId) {
   const result = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
   const booking = result.rows[0];
   if (!booking) {
      throw httpError(404, 'Booking not found');
   }
   if (booking.user_id !== userId) {
      throw httpError(403, 'You can only cancel your own bookings');
   }
   await db.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
}

module.exports = { bookSeat, listMyBookings, cancelBooking };
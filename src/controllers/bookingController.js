const bookingService = require('../services/bookingService');
const metrics = require('../config/metrics');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const validators = require('../utils/validators');

const book = asyncHandler(async (req, res) => {
   const eventId = validators.parseId(req.body.event_id);
   if (!eventId) throw httpError(400, 'event_id must be a positive number');

   const booking = await bookingService.bookSeat(req.user.id, eventId);
   metrics.bookingsTotal.inc();
   res.status(201).json(booking);
});

const mine = asyncHandler(async (req, res) => {
   res.json(await bookingService.listMyBookings(req.user.id));
});

const cancel = asyncHandler(async (req, res) => {
   const id = validators.parseId(req.params.id);
   if (!id) throw httpError(400, 'Invalid booking id');

   await bookingService.cancelBooking(req.user.id, id);
   res.status(204).send();
});

module.exports = { book, mine, cancel };
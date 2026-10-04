const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const validators = require('../utils/validators');

function readEventBody(body) {
   const { title, location, event_date, capacity } = body;
   if (!validators.isNonEmpty(title)) throw httpError(400, 'Title must be at least 3 characters');
   if (!validators.isNonEmpty(location)) throw httpError(400, 'Location must be at least 3 characters');
   if (!validators.isValidDate(event_date)) throw httpError(400, 'event_date must look like 2026-12-31');
   if (!validators.isValidCapacity(capacity)) throw httpError(400, 'Capacity must be a whole number from 1 to 1000');
   return { title, location, event_date, capacity };
}

function readId(req) {
   const id = validators.parseId(req.params.id);
   if (!id) throw httpError(400, 'Invalid event id');
   return id;
}

const list = asyncHandler(async (req, res) => {
   res.json(await eventService.listEvents());
});

const getOne = asyncHandler(async (req, res) => {
   res.json(await eventService.getEvent(readId(req)));
});

const create = asyncHandler(async (req, res) => {
   const event = await eventService.createEvent(readEventBody(req.body));
   res.status(201).json(event);
});

const update = asyncHandler(async (req, res) => {
   const event = await eventService.updateEvent(readId(req), readEventBody(req.body));
   res.json(event);
});

const remove = asyncHandler(async (req, res) => {
   await eventService.deleteEvent(readId(req));
   res.status(204).send();
});

module.exports = { list, getOne, create, update, remove };
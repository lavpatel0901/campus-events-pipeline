jest.mock('../../src/config/db');
const db = require('../../src/config/db');
const bookingService = require('../../src/services/bookingService');

afterEach(() => {
   jest.resetAllMocks();
});

test('books a seat when the event has space', async () => {
   db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, capacity: 2 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 5, user_id: 1, event_id: 1 }] });

   const booking = await bookingService.bookSeat(1, 1);
   expect(booking.id).toBe(5);
});

test('rejects a booking when the event does not exist', async () => {
   db.query.mockResolvedValueOnce({ rows: [] });
   await expect(bookingService.bookSeat(1, 99)).rejects.toMatchObject({ status: 404 });
});

test('rejects a double booking', async () => {
   db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, capacity: 5 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10 }] });
   await expect(bookingService.bookSeat(1, 1)).rejects.toMatchObject({ status: 409 });
});

test('rejects a booking when the event is full', async () => {
   db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, capacity: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });
   await expect(bookingService.bookSeat(2, 1)).rejects.toMatchObject({ status: 409 });
});

test('does not let a user cancel someone else booking', async () => {
   db.query.mockResolvedValueOnce({ rows: [{ id: 3, user_id: 2 }] });
   await expect(bookingService.cancelBooking(1, 3)).rejects.toMatchObject({ status: 403 });
});
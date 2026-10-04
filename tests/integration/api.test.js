// First I replace the real database with an in-memory PostgreSQL
jest.mock('../../src/config/db', () => {
   const { newDb } = require('pg-mem');
   const schema = require('../../src/config/schema');
   const { Pool } = newDb().adapters.createPg();
   const pool = new Pool();
   return {
      query: (text, params) => pool.query(text, params),
      initSchema: async () => {
         for (const statement of schema) {
            await pool.query(statement);
         }
      }
   };
});

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');
const userService = require('../../src/services/userService');

let adminToken;
let studentToken;
let student2Token;
let eventId;
let bookingId;

async function loginAs(email, password) {
   const res = await request(app).post('/api/auth/login').send({ email, password });
   return res.body.token;
}

beforeAll(async () => {
   await db.initSchema();
   await userService.seedAdmin('admin@test.com', 'Admin12345');
   await request(app).post('/api/auth/register').send({ name: 'Student One', email: 'one@test.com', password: 'Student123' });
   await request(app).post('/api/auth/register').send({ name: 'Student Two', email: 'two@test.com', password: 'Student123' });
   adminToken = await loginAs('admin@test.com', 'Admin12345');
   studentToken = await loginAs('one@test.com', 'Student123');
   student2Token = await loginAs('two@test.com', 'Student123');
});

describe('authentication', () => {
   test('rejects a duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'Student One', email: 'one@test.com', password: 'Student123' });
      expect(res.statusCode).toBe(409);
   });

   test('rejects a weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'Someone', email: 'new@test.com', password: '123' });
      expect(res.statusCode).toBe(400);
   });

   test('rejects a wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'one@test.com', password: 'WrongPass1' });
      expect(res.statusCode).toBe(401);
   });
});

describe('events', () => {
   test('a student cannot create an event', async () => {
      const res = await request(app).post('/api/events').set('Authorization', 'Bearer ' + studentToken)
         .send({ title: 'Hack Night', location: 'Burwood', event_date: '2026-12-01', capacity: 1 });
      expect(res.statusCode).toBe(403);
   });

   test('an admin can create an event', async () => {
      const res = await request(app).post('/api/events').set('Authorization', 'Bearer ' + adminToken)
         .send({ title: 'Hack Night', location: 'Burwood', event_date: '2026-12-01', capacity: 1 });
      expect(res.statusCode).toBe(201);
      eventId = res.body.id;
   });

   test('rejects an event with a bad date', async () => {
      const res = await request(app).post('/api/events').set('Authorization', 'Bearer ' + adminToken)
         .send({ title: 'Bad Event', location: 'Burwood', event_date: 'tomorrow', capacity: 10 });
      expect(res.statusCode).toBe(400);
   });

   test('anyone can list events and see one event', async () => {
      const list = await request(app).get('/api/events');
      expect(list.body.length).toBe(1);
      const one = await request(app).get('/api/events/' + eventId);
      expect(one.body.seats_left).toBe(1);
   });

   test('returns 404 for an unknown event', async () => {
      const res = await request(app).get('/api/events/999');
      expect(res.statusCode).toBe(404);
   });

   test('an admin can update an event', async () => {
      const res = await request(app).put('/api/events/' + eventId).set('Authorization', 'Bearer ' + adminToken)
         .send({ title: 'Hack Night Updated', location: 'Burwood', event_date: '2026-12-02', capacity: 1 });
      expect(res.body.title).toBe('Hack Night Updated');
   });
});

describe('bookings', () => {
   test('bookings need a login', async () => {
      const res = await request(app).get('/api/bookings/me');
      expect(res.statusCode).toBe(401);
   });

   test('a student can book a seat', async () => {
      const res = await request(app).post('/api/bookings').set('Authorization', 'Bearer ' + studentToken).send({ event_id: eventId });
      expect(res.statusCode).toBe(201);
      bookingId = res.body.id;
   });

   test('the same student cannot book twice', async () => {
      const res = await request(app).post('/api/bookings').set('Authorization', 'Bearer ' + studentToken).send({ event_id: eventId });
      expect(res.statusCode).toBe(409);
   });

   test('a second student cannot book a full event', async () => {
      const res = await request(app).post('/api/bookings').set('Authorization', 'Bearer ' + student2Token).send({ event_id: eventId });
      expect(res.statusCode).toBe(409);
   });

   test('a student can see their bookings', async () => {
      const res = await request(app).get('/api/bookings/me').set('Authorization', 'Bearer ' + studentToken);
      expect(res.body.length).toBe(1);
   });

   test('a student cannot cancel another student booking', async () => {
      const res = await request(app).delete('/api/bookings/' + bookingId).set('Authorization', 'Bearer ' + student2Token);
      expect(res.statusCode).toBe(403);
   });

   test('a student can cancel their own booking', async () => {
      const res = await request(app).delete('/api/bookings/' + bookingId).set('Authorization', 'Bearer ' + studentToken);
      expect(res.statusCode).toBe(204);
   });
});

describe('cleanup and system endpoints', () => {
   test('an admin can delete an event', async () => {
      const res = await request(app).delete('/api/events/' + eventId).set('Authorization', 'Bearer ' + adminToken);
      expect(res.statusCode).toBe(204);
   });

   test('health check works', async () => {
      const res = await request(app).get('/health');
      expect(res.body.status).toBe('ok');
   });

   test('metrics include the custom counters', async () => {
      const res = await request(app).get('/metrics');
      expect(res.text).toContain('bookings_total');
      expect(res.text).toContain('failed_logins_total');
   });

   test('the error endpoint returns 500', async () => {
      const res = await request(app).get('/error');
      expect(res.statusCode).toBe(500);
   });

   test('unknown routes return 404', async () => {
      const res = await request(app).get('/nothing-here');
      expect(res.statusCode).toBe(404);
   });
});
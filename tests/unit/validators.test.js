const v = require('../../src/utils/validators');

test('isNonEmpty accepts normal text and rejects short text', () => {
   expect(v.isNonEmpty('Hello')).toBe(true);
   expect(v.isNonEmpty('ab')).toBe(false);
   expect(v.isNonEmpty(123)).toBe(false);
});

test('isValidEmail checks the format', () => {
   expect(v.isValidEmail('student@deakin.edu.au')).toBe(true);
   expect(v.isValidEmail('not-an-email')).toBe(false);
});

test('isStrongPassword needs 8 characters', () => {
   expect(v.isStrongPassword('Password1')).toBe(true);
   expect(v.isStrongPassword('short')).toBe(false);
});

test('isValidDate accepts only YYYY-MM-DD', () => {
   expect(v.isValidDate('2026-12-31')).toBe(true);
   expect(v.isValidDate('31/12/2026')).toBe(false);
   expect(v.isValidDate('2026-99-99')).toBe(false);
});

test('isValidCapacity accepts whole numbers from 1 to 1000', () => {
   expect(v.isValidCapacity(50)).toBe(true);
   expect(v.isValidCapacity(0)).toBe(false);
   expect(v.isValidCapacity(1001)).toBe(false);
   expect(v.isValidCapacity(2.5)).toBe(false);
});

test('parseId returns a number or null', () => {
   expect(v.parseId('5')).toBe(5);
   expect(v.parseId('abc')).toBeNull();
   expect(v.parseId('-1')).toBeNull();
   expect(v.parseId(undefined)).toBeNull();
});
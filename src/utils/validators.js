function isNonEmpty(value, min = 3) {
   return typeof value === 'string' && value.trim().length >= min;
}

function isValidEmail(email) {
   return typeof email === 'string' && email.includes('@') && email.includes('.') && email.length <= 100;
}

function isStrongPassword(password) {
   return typeof password === 'string' && password.length >= 8;
}

function isValidDate(value) {
   return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isValidCapacity(value) {
   return Number.isInteger(value) && value > 0 && value <= 1000;
}

function parseId(value) {
   const number = Number(value);
   return Number.isInteger(number) && number > 0 ? number : null;
}

module.exports = { isNonEmpty, isValidEmail, isStrongPassword, isValidDate, isValidCapacity, parseId };
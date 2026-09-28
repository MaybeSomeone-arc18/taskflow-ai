// Run against compiled backend code. No database, API key or server required.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AppError } = require('../dist/utils/AppError.js');
const { sendSuccess } = require('../dist/utils/response.js');
const { asyncHandler } = require('../dist/utils/asyncHandler.js');

test('AppError retains status and operational details', () => {
  const err = new AppError('Invalid input', 422, [{ field: 'title' }]);
  assert.equal(err.message, 'Invalid input');
  assert.equal(err.statusCode, 422);
  assert.equal(err.isOperational, true);
  assert.deepEqual(err.errors, [{ field: 'title' }]);
});

test('sendSuccess sends the public API envelope and status', () => {
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  sendSuccess(res, { id: 't1' }, 'Created', 201);
  assert.equal(res.code, 201);
  assert.deepEqual(res.body, { status: 'success', message: 'Created', data: { id: 't1' } });
});

test('asyncHandler passes rejected route errors to next', async () => {
  const error = new Error('route failed');
  const forwarded = new Promise((resolve) => {
    asyncHandler(async () => { throw error; })({}, {}, resolve);
  });
  assert.equal(await forwarded, error);
});

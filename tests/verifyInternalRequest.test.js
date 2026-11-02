const test = require("node:test");
const assert = require("node:assert/strict");

const verifyInternalRequest = require("../middleware/verifyInternalRequest");

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test("rejects requests without internal secret", () => {
  const previousSecret = process.env.INTERNAL_API_SECRET;
  delete process.env.INTERNAL_API_SECRET;

  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  verifyInternalRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);

  if (previousSecret !== undefined) {
    process.env.INTERNAL_API_SECRET = previousSecret;
  }
});

test("rejects an invalid internal secret", () => {
  process.env.INTERNAL_API_SECRET = "correct-secret";

  const req = {
    headers: {
      "x-internal-api-secret": "wrong-secret",
      "x-authenticated-user-id": "user-1",
      "x-authenticated-user-name": "Test User",
      "x-authenticated-user-email": "test@example.com",
    },
  };

  const res = createResponse();
  let nextCalled = false;

  verifyInternalRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("rejects requests with missing user information", () => {
  process.env.INTERNAL_API_SECRET = "correct-secret";

  const req = {
    headers: {
      "x-internal-api-secret": "correct-secret",
      "x-authenticated-user-id": "user-1",
      "x-authenticated-user-name": "Test User",
    },
  };

  const res = createResponse();
  let nextCalled = false;

  verifyInternalRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("accepts valid internal requests and attaches user information", () => {
  process.env.INTERNAL_API_SECRET = "correct-secret";

  const req = {
    headers: {
      "x-internal-api-secret": "correct-secret",
      "x-authenticated-user-id": "user-1",
      "x-authenticated-user-name": "Test User",
      "x-authenticated-user-email": "TEST@EXAMPLE.COM",
    },
  };

  const res = createResponse();
  let nextCalled = false;

  verifyInternalRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.authenticatedUser, {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  });
});

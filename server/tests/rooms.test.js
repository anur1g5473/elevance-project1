const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { app } = require("../src/app");

test("POST /api/v1/rooms creates a room with secure metadata", async () => {
  const response = await request(app)
    .post("/api/v1/rooms")
    .send({
      title: "Product sync",
      hostName: "Alicia",
      requireAuth: true,
    });

  assert.equal(response.status, 201);
  assert.ok(response.body.roomId);
  assert.ok(response.body.hostToken);
  assert.ok(response.body.joinCode);
  assert.equal(response.body.title, "Product sync");
});

test("POST /api/v1/rooms/:roomId/join accepts valid guest access with join code", async () => {
  const roomResponse = await request(app)
    .post("/api/v1/rooms")
    .send({ title: "Demo room", hostName: "Alex", requireAuth: true });

  const roomId = roomResponse.body.roomId;
  const joinCode = roomResponse.body.joinCode;

  const response = await request(app)
    .post(`/api/v1/rooms/${roomId}/join`)
    .send({
      userName: "Sam",
      role: "guest",
      joinCode,
      deviceId: "device-123",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.message, "Participant joined the room successfully.");
  assert.equal(response.body.participant.userName, "Sam");
  assert.equal(response.body.participant.role, "guest");
});

test("POST /api/v1/rooms/:roomId/join rejects invalid join code", async () => {
  const roomResponse = await request(app)
    .post("/api/v1/rooms")
    .send({ title: "Guest only", hostName: "Morgan", requireAuth: true });

  const roomId = roomResponse.body.roomId;

  const response = await request(app)
    .post(`/api/v1/rooms/${roomId}/join`)
    .send({
      userName: "Taylor",
      role: "guest",
      joinCode: "WRONGCODE",
      deviceId: "device-456",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.code, "INVALID_JOIN_CODE");
});

test("POST /api/v1/rooms/:roomId/join rejects invalid host token", async () => {
  const roomResponse = await request(app)
    .post("/api/v1/rooms")
    .send({ title: "Host validation", hostName: "Jordan", requireAuth: true });

  const roomId = roomResponse.body.roomId;

  const response = await request(app)
    .post(`/api/v1/rooms/${roomId}/join`)
    .send({
      userName: "Jordan",
      role: "host",
      hostToken: "tampered-token",
      deviceId: "device-789",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.code, "HOST_AUTH_FAILED");
});

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createCallSession,
  toggleMute,
  toggleCamera,
  endCall,
} = require("../src/services/callSessionState");

test("createCallSession builds a one-to-one session with participant metadata", () => {
  const session = createCallSession({ localName: "Alicia", remoteName: "Sam" });

  assert.equal(session.status, "connected");
  assert.equal(session.participants.length, 2);
  assert.equal(session.localParticipant.name, "Alicia");
  assert.equal(session.remoteParticipant.name, "Sam");
  assert.equal(session.localParticipant.isMuted, false);
  assert.equal(session.localParticipant.isCameraOn, true);
});

test("toggleMute switches the local call state and keeps the session active", () => {
  const session = createCallSession({ localName: "Alicia", remoteName: "Sam" });

  const updated = toggleMute(session);

  assert.equal(updated.localParticipant.isMuted, true);
  assert.equal(updated.status, "connected");
});

test("toggleCamera toggles the camera state without mutating the remote participant", () => {
  const session = createCallSession({ localName: "Alicia", remoteName: "Sam" });

  const updated = toggleCamera(session);

  assert.equal(updated.localParticipant.isCameraOn, false);
  assert.equal(updated.remoteParticipant.isCameraOn, true);
});

test("endCall ends the session cleanly and preserves summary metadata", () => {
  const session = createCallSession({ localName: "Alicia", remoteName: "Sam" });

  const ended = endCall(session);

  assert.equal(ended.status, "ended");
  assert.ok(ended.endedAt);
  assert.equal(ended.participants.length, 2);
});

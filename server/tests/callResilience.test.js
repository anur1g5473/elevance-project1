const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createCallResilience,
  handleNetworkIssue,
  restoreConnection,
  updateParticipantPermission,
  handlePermissionDenied,
  startRecording,
  applyLowBandwidthMode,
} = require("../src/services/callResilience");

test("createCallResilience initializes a reconnect-safe call with participant permissions", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam", "Jordan"] });

  assert.equal(session.status, "connected");
  assert.equal(session.host.name, "Alicia");
  assert.equal(session.networkQuality, "good");
  assert.equal(session.permissions.chat, true);
  assert.equal(session.permissions.screenShare, true);
});

test("handleNetworkIssue switches the call into reconnect mode and tracks retry count", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = handleNetworkIssue(session, { participantId: "guest-1", reason: "packet_loss" });

  assert.equal(updated.status, "reconnecting");
  assert.equal(updated.reconnectAttempts, 1);
  assert.equal(updated.lastIssue, "packet_loss");
});

test("restoreConnection resumes normal operations after a weak network recovers", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });
  const degraded = handleNetworkIssue(session, { participantId: "guest-1", reason: "signal_drop" });
  const restored = restoreConnection(degraded);

  assert.equal(restored.status, "connected");
  assert.equal(restored.reconnectAttempts, 1);
});

test("updateParticipantPermission can restrict a guest's screen share without affecting host controls", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = updateParticipantPermission(session, "guest-1", "screenShare", false);

  assert.equal(updated.participants[1].permissions.screenShare, false);
  assert.equal(updated.host.permissions.screenShare, true);
});

test("handlePermissionDenied records denied access for the user and keeps the meeting active", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = handlePermissionDenied(session, "guest-1", "microphone");

  assert.equal(updated.permissionErrors.length, 1);
  assert.equal(updated.permissionErrors[0].participantId, "guest-1");
  assert.equal(updated.status, "connected");
});

test("startRecording records host-only capture and secure access metadata", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = startRecording(session, { initiatedBy: "host", mode: "host-only" });

  assert.equal(updated.recording.isRecording, true);
  assert.equal(updated.recording.initiatedBy, "host");
  assert.equal(updated.recording.mode, "host-only");
});

test("applyLowBandwidthMode lowers stream quality and preserves call continuity", () => {
  const session = createCallResilience({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = applyLowBandwidthMode(session, { quality: "480p", reason: "unstable_connection" });

  assert.equal(updated.networkQuality, "limited");
  assert.equal(updated.streamSettings.videoQuality, "480p");
  assert.equal(updated.status, "connected");
});

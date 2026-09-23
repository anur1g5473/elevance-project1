const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createGroupCallSession,
  addParticipant,
  muteParticipant,
  removeParticipant,
  assignCoHost,
  lockMeeting,
  sendChatMessage,
} = require("../src/services/groupCallSession");

test("createGroupCallSession builds a moderated group session with a host", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam", "Jordan"] });

  assert.equal(session.status, "active");
  assert.equal(session.host.name, "Alicia");
  assert.equal(session.participants.length, 3);
  assert.equal(session.isLocked, false);
});

test("muteParticipant updates a guest's status and preserves host privileges", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = muteParticipant(session, "guest-1");

  assert.equal(updated.participants[1].isMuted, true);
  assert.equal(updated.host.isMuted, false);
});

test("removeParticipant removes a guest and updates the participant list", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam", "Jordan"] });

  const updated = removeParticipant(session, "guest-2");

  assert.equal(updated.participants.length, 2);
  assert.equal(updated.participants.some((participant) => participant.id === "guest-2"), false);
});

test("assignCoHost grants host-level moderation to a guest and keeps the host as primary", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = assignCoHost(session, "guest-1");

  assert.equal(updated.coHosts.includes("guest-1"), true);
  assert.equal(updated.host.name, "Alicia");
});

test("lockMeeting restricts new joiners and prevents moderator changes while locked", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = lockMeeting(session, true);

  assert.equal(updated.isLocked, true);
  assert.equal(updated.status, "active");
});

test("sendChatMessage records the message and keeps the author metadata", () => {
  const session = createGroupCallSession({ hostName: "Alicia", participantNames: ["Sam"] });

  const updated = sendChatMessage(session, {
    senderId: "guest-1",
    senderName: "Sam",
    text: "Looks good.",
    type: "text",
  });

  assert.equal(updated.chatMessages.length, 1);
  assert.equal(updated.chatMessages[0].senderName, "Sam");
  assert.equal(updated.chatMessages[0].text, "Looks good.");
});

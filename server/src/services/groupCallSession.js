function createGroupCallSession({ hostName = "Host", participantNames = [] } = {}) {
  const host = {
    id: "host",
    name: String(hostName).trim() || "Host",
    role: "host",
    isMuted: false,
    isCameraOn: true,
    canShareScreen: true,
  };

  const guests = participantNames.map((name, index) => ({
    id: `guest-${index + 1}`,
    name: String(name).trim() || `Guest ${index + 1}`,
    role: "guest",
    isMuted: false,
    isCameraOn: true,
    canShareScreen: false,
  }));

  return {
    id: `call-${Date.now()}`,
    status: "active",
    isLocked: false,
    host,
    coHosts: [],
    participants: [host, ...guests],
    chatMessages: [],
    createdAt: new Date().toISOString(),
  };
}

function findParticipant(session, participantId) {
  return session.participants.find((participant) => participant.id === participantId);
}

function addParticipant(session, participant) {
  if (!session || !participant || !participant.id) {
    return session;
  }

  return {
    ...session,
    participants: [...session.participants, participant],
  };
}

function muteParticipant(session, participantId) {
  if (!session) {
    return session;
  }

  const updatedParticipants = session.participants.map((participant) => {
    if (participant.id !== participantId) {
      return participant;
    }

    return {
      ...participant,
      isMuted: !participant.isMuted,
    };
  });

  return {
    ...session,
    participants: updatedParticipants,
  };
}

function removeParticipant(session, participantId) {
  if (!session) {
    return session;
  }

  const filteredParticipants = session.participants.filter((participant) => participant.id !== participantId);

  return {
    ...session,
    participants: filteredParticipants,
    coHosts: (session.coHosts || []).filter((id) => id !== participantId),
  };
}

function assignCoHost(session, participantId) {
  if (!session || session.isLocked) {
    return session;
  }

  if (!session.coHosts.includes(participantId)) {
    return {
      ...session,
      coHosts: [...session.coHosts, participantId],
    };
  }

  return session;
}

function lockMeeting(session, shouldLock) {
  if (!session) {
    return null;
  }

  return {
    ...session,
    isLocked: Boolean(shouldLock),
    status: session.status || "active",
  };
}

function sendChatMessage(session, { senderId, senderName, text, type = "text" }) {
  if (!session || !senderId || !text) {
    return session;
  }

  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    senderId,
    senderName: senderName || "Participant",
    text: String(text).trim(),
    type,
    createdAt: new Date().toISOString(),
  };

  return {
    ...session,
    chatMessages: [...(session.chatMessages || []), message],
  };
}

module.exports = {
  createGroupCallSession,
  addParticipant,
  muteParticipant,
  removeParticipant,
  assignCoHost,
  lockMeeting,
  sendChatMessage,
  findParticipant,
};

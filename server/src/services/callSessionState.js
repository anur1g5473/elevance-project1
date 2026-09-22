function createCallSession({ localName = "Local User", remoteName = "Remote User" } = {}) {
  const localParticipant = {
    id: "local-user",
    name: String(localName).trim() || "Local User",
    role: "host",
    isMuted: false,
    isCameraOn: true,
  };

  const remoteParticipant = {
    id: "remote-user",
    name: String(remoteName).trim() || "Remote User",
    role: "guest",
    isMuted: false,
    isCameraOn: true,
  };

  return {
    status: "connected",
    startedAt: new Date().toISOString(),
    endedAt: null,
    localParticipant,
    remoteParticipant,
    participants: [localParticipant, remoteParticipant],
  };
}

function toggleMute(session) {
  if (!session || !session.localParticipant) {
    return session;
  }

  return {
    ...session,
    localParticipant: {
      ...session.localParticipant,
      isMuted: !session.localParticipant.isMuted,
    },
    status: "connected",
  };
}

function toggleCamera(session) {
  if (!session || !session.localParticipant) {
    return session;
  }

  return {
    ...session,
    localParticipant: {
      ...session.localParticipant,
      isCameraOn: !session.localParticipant.isCameraOn,
    },
    remoteParticipant: {
      ...session.remoteParticipant,
      isCameraOn: true,
    },
    status: "connected",
  };
}

function endCall(session) {
  if (!session) {
    return null;
  }

  return {
    ...session,
    status: "ended",
    endedAt: new Date().toISOString(),
  };
}

module.exports = {
  createCallSession,
  toggleMute,
  toggleCamera,
  endCall,
};

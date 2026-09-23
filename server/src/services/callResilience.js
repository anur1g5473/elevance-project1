function createParticipant({ id, name, role = "guest" }) {
  return {
    id,
    name: String(name).trim() || (role === "host" ? "Host" : "Guest"),
    role,
    isMuted: false,
    isCameraOn: true,
    permissions: {
      microphone: true,
      camera: true,
      screenShare: role === "host",
      chat: true,
    },
  };
}

function createCallResilience({ hostName = "Host", participantNames = [] } = {}) {
  const host = createParticipant({ id: "host", name: hostName, role: "host" });
  const participants = [host, ...participantNames.map((name, index) => createParticipant({
    id: `guest-${index + 1}`,
    name,
    role: "guest",
  }))];

  return {
    id: `resilience-${Date.now()}`,
    status: "connected",
    networkQuality: "good",
    reconnectAttempts: 0,
    lastIssue: null,
    permissions: {
      microphone: true,
      camera: true,
      screenShare: true,
      chat: true,
    },
    host,
    participants,
    permissionErrors: [],
    recording: {
      isRecording: false,
      initiatedBy: null,
      mode: "host-only",
      startedAt: null,
      access: "host-only",
    },
    streamSettings: {
      videoQuality: "720p",
      audioQuality: "stereo",
      noiseSuppression: true,
    },
    createdAt: new Date().toISOString(),
  };
}

function updateParticipantPermission(session, participantId, permission, isAllowed) {
  if (!session || !participantId || !permission) {
    return session;
  }

  const participants = session.participants.map((participant) => {
    if (participant.id !== participantId) {
      return participant;
    }

    return {
      ...participant,
      permissions: {
        ...participant.permissions,
        [permission]: Boolean(isAllowed),
      },
    };
  });

  const host = session.host && participantId === session.host.id
    ? {
        ...session.host,
        permissions: {
          ...session.host.permissions,
          [permission]: Boolean(isAllowed),
        },
      }
    : session.host;

  return {
    ...session,
    host,
    participants,
    permissions: {
      ...session.permissions,
      [permission]: participantId === "host" ? Boolean(isAllowed) : session.permissions[permission],
    },
  };
}

function handleNetworkIssue(session, { participantId = "host", reason = "network" } = {}) {
  if (!session) {
    return session;
  }

  return {
    ...session,
    status: "reconnecting",
    lastIssue: reason,
    reconnectAttempts: (session.reconnectAttempts || 0) + 1,
    participants: session.participants.map((participant) => participant.id === participantId
      ? { ...participant, connectionState: "reconnecting" }
      : participant),
  };
}

function restoreConnection(session) {
  if (!session) {
    return session;
  }

  return {
    ...session,
    status: "connected",
    networkQuality: session.networkQuality === "limited" ? "limited" : "good",
  };
}

function handlePermissionDenied(session, participantId, permission) {
  if (!session) {
    return session;
  }

  return {
    ...session,
    status: "connected",
    permissionErrors: [
      ...(session.permissionErrors || []),
      {
        participantId,
        permission,
        message: `${permission} permission was denied`,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function startRecording(session, { initiatedBy = "host", mode = "host-only" } = {}) {
  if (!session) {
    return session;
  }

  if (initiatedBy !== "host" && session.host && initiatedBy !== session.host.id) {
    return session;
  }

  return {
    ...session,
    recording: {
      isRecording: true,
      initiatedBy,
      mode,
      startedAt: new Date().toISOString(),
      access: "host-only",
    },
  };
}

function applyLowBandwidthMode(session, { quality = "480p", reason = "unstable_connection" } = {}) {
  if (!session) {
    return session;
  }

  return {
    ...session,
    status: "connected",
    networkQuality: "limited",
    lastIssue: reason,
    streamSettings: {
      ...session.streamSettings,
      videoQuality: quality,
      audioQuality: "low",
    },
  };
}

module.exports = {
  createCallResilience,
  updateParticipantPermission,
  handleNetworkIssue,
  restoreConnection,
  handlePermissionDenied,
  startRecording,
  applyLowBandwidthMode,
};

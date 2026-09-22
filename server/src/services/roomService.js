const { v4: uuidv4 } = require("uuid");

const rooms = new Map();
const MAX_PARTICIPANTS = 8;

function normalizeRoomTitle(title) {
  return String(title || "Untitled room").trim() || "Untitled room";
}

function normalizeUserName(name) {
  return String(name || "Guest").trim() || "Guest";
}

function createRoom({ title, hostName, requireAuth = true }) {
  const roomId = uuidv4().slice(0, 8);
  const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const hostToken = `${uuidv4()}-${uuidv4()}`;

  const room = {
    id: roomId,
    title: normalizeRoomTitle(title),
    hostName: normalizeUserName(hostName),
    requireAuth,
    joinCode,
    hostToken,
    inviteLink: `https://example.com/call/${roomId}?code=${joinCode}`,
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  rooms.set(roomId, room);

  return {
    roomId: room.id,
    title: room.title,
    hostName: room.hostName,
    requireAuth: room.requireAuth,
    joinCode: room.joinCode,
    hostToken: room.hostToken,
    inviteLink: room.inviteLink,
    participants: room.participants,
    createdAt: room.createdAt,
  };
}

function getRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  return {
    id: room.id,
    title: room.title,
    hostName: room.hostName,
    requireAuth: room.requireAuth,
    joinCode: room.joinCode,
    inviteLink: room.inviteLink,
    participants: room.participants,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    maxParticipants: MAX_PARTICIPANTS,
  };
}

function joinRoom({ roomId, userName, role = "guest", joinCode, hostToken, deviceId }) {
  const room = rooms.get(roomId);
  if (!room) {
    const err = new Error("Room not found.");
    err.code = "ROOM_NOT_FOUND";
    throw err;
  }

  if (room.participants.length >= MAX_PARTICIPANTS) {
    const err = new Error("Room participant limit reached.");
    err.code = "ROOM_FULL";
    throw err;
  }

  if (deviceId && room.participants.some((participant) => participant.deviceId === deviceId)) {
    const err = new Error("This device is already connected to the room.");
    err.code = "DEVICE_ALREADY_IN_ROOM";
    throw err;
  }

  const normalizedRole = role === "host" ? "host" : "guest";

  if (room.requireAuth && normalizedRole === "host") {
    if (!hostToken || hostToken !== room.hostToken) {
      const err = new Error("Host authentication failed.");
      err.code = "HOST_AUTH_FAILED";
      throw err;
    }
  }

  if (room.requireAuth && normalizedRole === "guest") {
    if (!joinCode || joinCode !== room.joinCode) {
      const err = new Error("Invalid room access code.");
      err.code = "INVALID_JOIN_CODE";
      throw err;
    }
  }

  const participant = {
    id: uuidv4(),
    userName: normalizeUserName(userName),
    role: normalizedRole,
    deviceId: deviceId || `device-${uuidv4()}`,
    joinedAt: new Date().toISOString(),
    isMuted: false,
    isCameraOn: true,
  };

  room.participants.push(participant);
  room.updatedAt = new Date().toISOString();

  return {
    roomId: room.id,
    roomTitle: room.title,
    participant: {
      id: participant.id,
      userName: participant.userName,
      role: participant.role,
      deviceId: participant.deviceId,
      isMuted: participant.isMuted,
      isCameraOn: participant.isCameraOn,
      joinedAt: participant.joinedAt,
    },
    participantCount: room.participants.length,
    maxParticipants: MAX_PARTICIPANTS,
    needsHostApproval: false,
  };
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  MAX_PARTICIPANTS,
  rooms,
};

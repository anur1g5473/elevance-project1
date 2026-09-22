const express = require("express");
const { createRoom, getRoom, joinRoom } = require("../services/roomService");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { title, hostName, requireAuth } = req.body || {};
    const room = createRoom({ title, hostName, requireAuth });

    return res.status(201).json({
      message: "Room created successfully.",
      ...room,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);

  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  return res.status(200).json({ room });
});

router.post("/:roomId/join", (req, res) => {
  try {
    const { userName, role, joinCode, hostToken, deviceId } = req.body || {};
    const result = joinRoom({
      roomId: req.params.roomId,
      userName,
      role,
      joinCode,
      hostToken,
      deviceId,
    });

    return res.status(200).json({
      message: "Participant joined the room successfully.",
      ...result,
    });
  } catch (error) {
    const statusCode =
      error.code === "ROOM_NOT_FOUND"
        ? 404
        : error.code === "ROOM_FULL"
          ? 409
          : error.code === "INVALID_JOIN_CODE" || error.code === "HOST_AUTH_FAILED"
            ? 401
            : error.code === "DEVICE_ALREADY_IN_ROOM"
              ? 409
              : 400;

    return res.status(statusCode).json({ message: error.message, code: error.code || "UNKNOWN_ERROR" });
  }
});

module.exports = router;

const createRoomForm = document.getElementById("create-room-form");
const joinRoomForm = document.getElementById("join-room-form");
const resultOutput = document.getElementById("result-output");

async function handleCreateRoom(event) {
  event.preventDefault();

  const formData = new FormData(createRoomForm);
  const payload = {
    title: formData.get("title"),
    hostName: formData.get("hostName"),
    requireAuth: formData.get("requireAuth") === "on",
  };

  const response = await fetch("/api/v1/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  resultOutput.textContent = JSON.stringify(data, null, 2);
}

async function handleJoinRoom(event) {
  event.preventDefault();

  const formData = new FormData(joinRoomForm);
  const payload = {
    userName: formData.get("userName"),
    role: "guest",
    joinCode: formData.get("joinCode"),
    deviceId: `browser-${Date.now()}`,
  };

  const roomId = formData.get("roomId");
  const response = await fetch(`/api/v1/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  resultOutput.textContent = JSON.stringify(data, null, 2);
}

createRoomForm.addEventListener("submit", handleCreateRoom);
joinRoomForm.addEventListener("submit", handleJoinRoom);

const createRoomForm = document.getElementById("create-room-form");
const joinRoomForm = document.getElementById("join-room-form");
const resultOutput = document.getElementById("result-output");
const callStatus = document.getElementById("call-status");
const localName = document.getElementById("local-name");
const localMeta = document.getElementById("local-meta");
const remoteName = document.getElementById("remote-name");
const remoteMeta = document.getElementById("remote-meta");
const participantList = document.getElementById("participant-list");

const callState = {
  status: "Connected",
  localParticipant: {
    name: "Alicia",
    isMuted: false,
    isCameraOn: true,
  },
  remoteParticipant: {
    name: "Sam",
    isMuted: false,
    isCameraOn: true,
  },
};

function renderCallState() {
  const localStatus = callState.localParticipant.isMuted ? "Mic off" : "Mic on";
  const localCamera = callState.localParticipant.isCameraOn ? "Camera on" : "Camera off";
  const remoteStatus = callState.remoteParticipant.isMuted ? "Mic off" : "Mic on";
  const remoteCamera = callState.remoteParticipant.isCameraOn ? "Camera on" : "Camera off";

  localName.textContent = callState.localParticipant.name;
  remoteName.textContent = callState.remoteParticipant.name;
  localMeta.textContent = `${localStatus} • ${localCamera}`;
  remoteMeta.textContent = `${remoteStatus} • ${remoteCamera}`;
  participantList.innerHTML = `
    <li>${callState.localParticipant.name} • Host</li>
    <li>${callState.remoteParticipant.name} • Guest</li>
  `;
  callStatus.textContent = callState.status;

  const muteButton = document.querySelector('[data-action="mute"]');
  const cameraButton = document.querySelector('[data-action="camera"]');

  if (muteButton) {
    muteButton.textContent = callState.localParticipant.isMuted ? "Unmute" : "Mute";
  }

  if (cameraButton) {
    cameraButton.textContent = callState.localParticipant.isCameraOn ? "Camera on" : "Camera off";
  }
}

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

function handleCallControl(event) {
  const action = event.currentTarget.dataset.action;

  if (action === "mute") {
    callState.localParticipant.isMuted = !callState.localParticipant.isMuted;
  }

  if (action === "camera") {
    callState.localParticipant.isCameraOn = !callState.localParticipant.isCameraOn;
  }

  if (action === "leave") {
    callState.status = "Ended";
  }

  renderCallState();
}

createRoomForm.addEventListener("submit", handleCreateRoom);
joinRoomForm.addEventListener("submit", handleJoinRoom);
document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", handleCallControl);
});
renderCallState();

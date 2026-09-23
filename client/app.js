const createRoomForm = document.getElementById("create-room-form");
const joinRoomForm = document.getElementById("join-room-form");
const resultOutput = document.getElementById("result-output");
const callStatus = document.getElementById("call-status");
const localName = document.getElementById("local-name");
const localMeta = document.getElementById("local-meta");
const remoteName = document.getElementById("remote-name");
const remoteMeta = document.getElementById("remote-meta");
const participantList = document.getElementById("participant-list");

const downloadUsed = document.getElementById("download-used");
const downloadRemaining = document.getElementById("download-remaining");
const downloadQueue = document.getElementById("download-queue");
const downloadLog = document.getElementById("download-log");
const activePlanPill = document.getElementById("active-plan-pill");
const qualityPill = document.getElementById("quality-pill");
const playerProgress = document.getElementById("player-progress");
const playerVolume = document.getElementById("player-volume");
const playerQuality = document.getElementById("player-quality");
const playToggle = document.getElementById("play-toggle");
const subtitleToggle = document.getElementById("subtitle-toggle");
const pipToggle = document.getElementById("pip-toggle");
const theaterToggle = document.getElementById("theater-toggle");
const commentList = document.getElementById("comment-list");
const securityToggle = document.getElementById("security-toggle");

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

const downloadState = {
  used: 14,
  limit: 20,
  queue: 2,
  events: [
    "HD asset synced from project library",
    "Resume restored for current session",
  ],
};

const subscriptionState = {
  currentPlan: "Free",
};

const playerState = {
  title: "Studio session recap",
  isPlaying: false,
  subtitlesEnabled: false,
  pictureInPicture: false,
  theaterMode: false,
  progress: 28,
  volume: 80,
  quality: "1080p",
};

const securityState = {
  locked: false,
};

function setActiveFeature(featureName) {
  document.querySelectorAll(".feature-tab").forEach((button) => {
    const isActive = button.dataset.featureTab === featureName;
    button.classList.toggle("is-active", isActive);
  });

  document.querySelectorAll(".feature-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === featureName);
  });
}

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

function renderDownloads() {
  const remaining = Math.max(downloadState.limit - downloadState.used, 0);
  downloadUsed.textContent = `${downloadState.used} MB`;
  downloadRemaining.textContent = `${remaining} MB`;
  downloadQueue.textContent = `${downloadState.queue} active`;
  document.querySelector(".pill").textContent = `${subscriptionState.currentPlan} plan`;

  downloadLog.innerHTML = downloadState.events
    .slice(0, 4)
    .map((event) => `<li>${event}</li>`)
    .join("");
}

function renderSubscriptionPlans() {
  activePlanPill.textContent = subscriptionState.currentPlan;
  document.querySelectorAll(".plan-card").forEach((card) => {
    const isSelected = card.dataset.planCard === subscriptionState.currentPlan;
    card.classList.toggle("is-selected", isSelected);
    const button = card.querySelector(".plan-button");
    button.textContent = isSelected ? "Current plan" : "Switch";
  });
}

function renderPlayer() {
  const stage = document.getElementById("player-stage");
  stage.classList.toggle("theater-mode", playerState.theaterMode);
  stage.classList.toggle("pip-mode", playerState.pictureInPicture);
  qualityPill.textContent = playerState.quality;
  playToggle.textContent = playerState.isPlaying ? "Pause" : "Play";
  subtitleToggle.textContent = playerState.subtitlesEnabled ? "Subtitles on" : "Subtitles off";
  pipToggle.textContent = playerState.pictureInPicture ? "PiP on" : "PiP off";
  theaterToggle.textContent = playerState.theaterMode ? "Theater on" : "Theater off";
  playerProgress.value = playerState.progress;
  playerVolume.value = playerState.volume;
  playerQuality.value = playerState.quality;
}

function renderComments(languageFilter = "all") {
  const items = [...commentList.querySelectorAll("li")];
  items.forEach((item) => {
    const shouldShow = languageFilter === "all" || item.dataset.language === languageFilter;
    item.style.display = shouldShow ? "list-item" : "none";
  });

  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === languageFilter);
  });
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

function handleDownload(event) {
  const size = Number(event.currentTarget.dataset.downloadSize);
  const possibleLimit = subscriptionState.currentPlan === "Gold" ? 200 : subscriptionState.currentPlan === "Silver" ? 80 : subscriptionState.currentPlan === "Bronze" ? 35 : 20;

  if (downloadState.used + size > possibleLimit) {
    downloadState.events.unshift(`Blocked: request exceeds ${subscriptionState.currentPlan} quota`);
    downloadState.queue = Math.max(downloadState.queue, 1);
    renderDownloads();
    return;
  }

  downloadState.used += size;
  downloadState.queue = Math.max(downloadState.queue - 1, 1);
  downloadState.events.unshift(`Download approved • ${size} MB file added to library`);
  renderDownloads();
}

function handlePlanSwitch(event) {
  const plan = event.currentTarget.dataset.planSelect;
  subscriptionState.currentPlan = plan;
  const planMap = {
    Free: 20,
    Bronze: 35,
    Silver: 80,
    Gold: 200,
  };
  downloadState.limit = planMap[plan] || 20;
  downloadState.events.unshift(`Plan switched to ${plan}`);
  renderSubscriptionPlans();
  renderDownloads();
}

function handlePlayerChange() {
  playerState.progress = Number(playerProgress.value);
  playerState.volume = Number(playerVolume.value);
  playerState.quality = playerQuality.value;
  renderPlayer();
}

function handlePlayerToggle() {
  playerState.isPlaying = !playerState.isPlaying;
  renderPlayer();
}

function handleSubtitleToggle() {
  playerState.subtitlesEnabled = !playerState.subtitlesEnabled;
  renderPlayer();
}

function handlePipToggle() {
  playerState.pictureInPicture = !playerState.pictureInPicture;
  renderPlayer();
}

function handleTheaterToggle() {
  playerState.theaterMode = !playerState.theaterMode;
  renderPlayer();
}

function handleSecurityToggle() {
  securityState.locked = !securityState.locked;
  securityToggle.textContent = securityState.locked ? "Unlock session" : "Lock session";
  securityToggle.classList.toggle("warning", securityState.locked);
}

document.querySelectorAll("[data-feature-tab]").forEach((button) => {
  button.addEventListener("click", () => setActiveFeature(button.dataset.featureTab));
});

createRoomForm.addEventListener("submit", handleCreateRoom);
joinRoomForm.addEventListener("submit", handleJoinRoom);
document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", handleCallControl);
});
document.querySelectorAll("[data-download-size]").forEach((button) => {
  button.addEventListener("click", handleDownload);
});
document.querySelectorAll("[data-plan-select]").forEach((button) => {
  button.addEventListener("click", handlePlanSwitch);
});

playerProgress.addEventListener("input", handlePlayerChange);
playerVolume.addEventListener("input", handlePlayerChange);
playerQuality.addEventListener("change", handlePlayerChange);
playToggle.addEventListener("click", handlePlayerToggle);
subtitleToggle.addEventListener("click", handleSubtitleToggle);
pipToggle.addEventListener("click", handlePipToggle);
theaterToggle.addEventListener("click", handleTheaterToggle);

securityToggle.addEventListener("click", handleSecurityToggle);

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => renderComments(button.dataset.language));
});

renderCallState();
renderDownloads();
renderSubscriptionPlans();
renderPlayer();
renderComments();
handleSecurityToggle();

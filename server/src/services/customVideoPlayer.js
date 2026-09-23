function clamp(value, min, max, fallback = min) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.min(Math.max(numericValue, min), max);
}

function createPlayerState({ title = "Untitled video", duration = 0, quality = "720p", progressPercent = 0, volume = 0.8 } = {}) {
  const safeDuration = Number(duration) || 0;
  const safeProgress = clamp(progressPercent, 0, 100, 0);
  const safeVolume = clamp(volume, 0, 1, 0.8);
  const currentTime = safeDuration ? (safeDuration * safeProgress) / 100 : 0;

  return {
    title: String(title).trim() || "Untitled video",
    duration: safeDuration,
    currentTime,
    volume: safeVolume,
    playbackRate: 1,
    isPlaying: false,
    muted: false,
    subtitlesEnabled: false,
    bufferingPercent: 0,
    progressPercent: safeProgress,
    lastWatchedPosition: currentTime,
    quality: String(quality).trim() || "720p",
    pictureInPicture: false,
    theaterMode: false,
    autoHideControls: false,
    qualityOptions: ["240p", "480p", "720p", "1080p", "4K"],
  };
}

function togglePlayback(state) {
  if (!state) return state;

  return {
    ...state,
    isPlaying: !state.isPlaying,
  };
}

function setVolume(state, nextVolume) {
  if (!state) return state;

  const safeVolume = clamp(nextVolume, 0, 1, state.volume);

  return {
    ...state,
    volume: safeVolume,
    muted: safeVolume <= 0,
  };
}

function seekTo(state, seconds) {
  if (!state) return state;

  const safeSeconds = clamp(seconds, 0, state.duration || seconds, 0);

  return {
    ...state,
    currentTime: safeSeconds,
    lastWatchedPosition: safeSeconds,
    progressPercent: state.duration ? (safeSeconds / state.duration) * 100 : 0,
  };
}

function setPlaybackRate(state, rate) {
  if (!state) return state;

  const safeRate = Number(rate) || 1;

  return {
    ...state,
    playbackRate: safeRate,
  };
}

function toggleSubtitles(state) {
  if (!state) return state;

  return {
    ...state,
    subtitlesEnabled: !state.subtitlesEnabled,
  };
}

function updateBuffering(state, bufferingPercent) {
  if (!state) return state;

  return {
    ...state,
    bufferingPercent: clamp(bufferingPercent, 0, 100, state.bufferingPercent),
  };
}

function saveProgress(state, progressPercent) {
  if (!state) return state;

  const normalizedProgress = Number(progressPercent);
  const ratioProgress = normalizedProgress > 1 ? normalizedProgress : normalizedProgress * 100;
  const safeProgress = clamp(ratioProgress, 0, 100, state.progressPercent || 0);
  const lastWatchedPosition = state.duration ? (state.duration * safeProgress) / 100 : 0;

  return {
    ...state,
    progressPercent: safeProgress,
    lastWatchedPosition,
    currentTime: lastWatchedPosition,
  };
}

function restoreProgress(state, seconds) {
  if (!state) return state;

  const safeSeconds = clamp(seconds, 0, state.duration || seconds, 0);

  return {
    ...state,
    currentTime: safeSeconds,
    lastWatchedPosition: safeSeconds,
    progressPercent: state.duration ? (safeSeconds / state.duration) * 100 : 0,
    isPlaying: true,
  };
}

function setPictureInPicture(state, enabled) {
  if (!state) return state;

  return {
    ...state,
    pictureInPicture: Boolean(enabled),
  };
}

function setTheaterMode(state, enabled) {
  if (!state) return state;

  return {
    ...state,
    theaterMode: Boolean(enabled),
  };
}

module.exports = {
  clamp,
  createPlayerState,
  togglePlayback,
  setVolume,
  seekTo,
  setPlaybackRate,
  toggleSubtitles,
  updateBuffering,
  saveProgress,
  restoreProgress,
  setPictureInPicture,
  setTheaterMode,
};

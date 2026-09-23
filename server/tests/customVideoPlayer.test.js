const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createPlayerState,
  togglePlayback,
  seekTo,
  setVolume,
  setPlaybackRate,
  toggleSubtitles,
  updateBuffering,
  saveProgress,
  restoreProgress,
  setPictureInPicture,
  setTheaterMode,
} = require("../src/services/customVideoPlayer");

test("createPlayerState builds a standard player state with playback controls and quality metadata", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240, quality: "1080p" });

  assert.equal(player.title, "Sample Video");
  assert.equal(player.isPlaying, false);
  assert.equal(player.volume, 0.8);
  assert.equal(player.quality, "1080p");
  assert.equal(player.bufferingPercent, 0);
});

test("togglePlayback and setVolume update the active state without breaking the current time", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240 });

  const playing = togglePlayback(player);
  const volumeSet = setVolume(playing, 0.5);

  assert.equal(playing.isPlaying, true);
  assert.equal(volumeSet.volume, 0.5);
  assert.equal(volumeSet.currentTime, 0);
});

test("seekTo, setPlaybackRate, and toggleSubtitles adjust the user interaction state correctly", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240 });

  const seeking = seekTo(player, 90);
  const rateChanged = setPlaybackRate(seeking, 1.5);
  const subtitleToggled = toggleSubtitles(rateChanged);

  assert.equal(seeking.currentTime, 90);
  assert.equal(rateChanged.playbackRate, 1.5);
  assert.equal(subtitleToggled.subtitlesEnabled, true);
});

test("updateBuffering and saveProgress track playback health and resume position", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240 });

  const buffering = updateBuffering(player, 62);
  const saved = saveProgress(buffering, 0.62);

  assert.equal(buffering.bufferingPercent, 62);
  assert.equal(saved.progressPercent, 62);
  assert.equal(saved.lastWatchedPosition, 148.8);
});

test("restoreProgress restores the last watched position and keeps the player active if the video was resumed", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240, progressPercent: 45 });

  const restored = restoreProgress(player, 108);

  assert.equal(restored.lastWatchedPosition, 108);
  assert.equal(restored.currentTime, 108);
  assert.equal(restored.isPlaying, true);
});

test("setPictureInPicture and setTheaterMode reflect the visual play mode state", () => {
  const player = createPlayerState({ title: "Sample Video", duration: 240 });

  const pip = setPictureInPicture(player, true);
  const theater = setTheaterMode(pip, true);

  assert.equal(pip.pictureInPicture, true);
  assert.equal(theater.theaterMode, true);
});

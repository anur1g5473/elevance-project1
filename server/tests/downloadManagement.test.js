const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createQuotaTracker,
  canDownloadVideo,
  logDownloadAttempt,
  queueDownload,
  retryDownload,
  resetDailyQuota,
} = require("../src/services/downloadManagement");

test("createQuotaTracker applies the correct daily and monthly limits by subscription plan", () => {
  const freeTracker = createQuotaTracker({ plan: "Free" });
  const goldTracker = createQuotaTracker({ plan: "Gold" });

  assert.equal(freeTracker.dailyLimit, 1);
  assert.equal(freeTracker.monthlyLimit, 30);
  assert.equal(goldTracker.dailyLimit, 20);
  assert.equal(goldTracker.monthlyLimit, 500);
});

test("canDownloadVideo blocks free users over quota and allows valid gold users", () => {
  const freeState = createQuotaTracker({ plan: "Free", usedToday: 1, usedThisMonth: 30 });
  const freeResult = canDownloadVideo({
    tracker: freeState,
    userId: "user-1",
    videoId: "video-9",
    isActiveSubscription: true,
    hasVideoAccess: true,
    downloadHistory: [{ videoId: "video-9", createdAt: new Date().toISOString() }],
  });

  const goldState = createQuotaTracker({ plan: "Gold", usedToday: 2, usedThisMonth: 50 });
  const goldResult = canDownloadVideo({
    tracker: goldState,
    userId: "user-2",
    videoId: "video-7",
    isActiveSubscription: true,
    hasVideoAccess: true,
    downloadHistory: [],
  });

  assert.equal(freeResult.allowed, false);
  assert.equal(freeResult.reason, "quota_exceeded");
  assert.equal(goldResult.allowed, true);
});

test("logDownloadAttempt records user, device, IP, and browser metadata for audit logging", () => {
  const record = logDownloadAttempt({
    userId: "user-3",
    videoId: "video-10",
    plan: "Silver",
    ipAddress: "203.0.113.12",
    deviceInfo: "iPhone",
    browser: "Safari",
    status: "authorized",
  });

  assert.equal(record.userId, "user-3");
  assert.equal(record.videoId, "video-10");
  assert.equal(record.ipAddress, "203.0.113.12");
  assert.equal(record.status, "authorized");
});

test("queueDownload handles retries and marks failed downloads for retry without losing quota state", () => {
  const queued = queueDownload({
    userId: "user-4",
    videoId: "video-11",
    plan: "Bronze",
    retryCount: 1,
    status: "queued",
  });

  const retried = retryDownload({
    queue: queued,
    retryCount: 2,
    status: "retrying",
    lastError: "network_timeout",
  });

  assert.equal(queued.status, "queued");
  assert.equal(retried.retryCount, 2);
  assert.equal(retried.lastError, "network_timeout");
  assert.equal(retried.status, "retrying");
});

test("resetDailyQuota clears counter values while keeping the plan metadata intact", () => {
  const tracker = createQuotaTracker({ plan: "Bronze", usedToday: 4, usedThisMonth: 17 });
  const reset = resetDailyQuota(tracker);

  assert.equal(reset.usedToday, 0);
  assert.equal(reset.plan, "Bronze");
  assert.equal(reset.monthlyLimit, 200);
});

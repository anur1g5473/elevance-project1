const PLAN_LIMITS = {
  Free: { dailyLimit: 1, monthlyLimit: 30 },
  Bronze: { dailyLimit: 5, monthlyLimit: 200 },
  Silver: { dailyLimit: 12, monthlyLimit: 300 },
  Gold: { dailyLimit: 20, monthlyLimit: 500 },
};

function createQuotaTracker({ plan = "Free", usedToday = 0, usedThisMonth = 0 } = {}) {
  const normalizedPlan = PLAN_LIMITS[plan] ? plan : "Free";
  const limits = PLAN_LIMITS[normalizedPlan];

  return {
    plan: normalizedPlan,
    dailyLimit: limits.dailyLimit,
    monthlyLimit: limits.monthlyLimit,
    usedToday: Number(usedToday) || 0,
    usedThisMonth: Number(usedThisMonth) || 0,
    lastResetAt: new Date().toISOString(),
  };
}

function canDownloadVideo({
  tracker,
  userId,
  videoId,
  isActiveSubscription = true,
  hasVideoAccess = true,
  downloadHistory = [],
}) {
  if (!userId || !videoId) {
    return { allowed: false, reason: "missing_identity" };
  }

  if (!isActiveSubscription) {
    return { allowed: false, reason: "subscription_inactive" };
  }

  if (!hasVideoAccess) {
    return { allowed: false, reason: "video_unavailable" };
  }

  const normalizedTracker = tracker || createQuotaTracker({ plan: "Free" });
  const duplicateDownload = downloadHistory.some((item) => {
    if (item.videoId !== videoId || item.userId !== userId) {
      return false;
    }

    const createdAt = new Date(item.createdAt || 0).getTime();
    const ageMs = Date.now() - createdAt;
    return ageMs < 24 * 60 * 60 * 1000;
  });

  if (duplicateDownload) {
    return { allowed: false, reason: "duplicate_download" };
  }

  if (normalizedTracker.usedToday >= normalizedTracker.dailyLimit || normalizedTracker.usedThisMonth >= normalizedTracker.monthlyLimit) {
    return { allowed: false, reason: "quota_exceeded" };
  }

  return {
    allowed: true,
    reason: "ok",
    remainingDaily: Math.max(normalizedTracker.dailyLimit - normalizedTracker.usedToday, 0),
    remainingMonthly: Math.max(normalizedTracker.monthlyLimit - normalizedTracker.usedThisMonth, 0),
  };
}

function logDownloadAttempt({
  userId,
  videoId,
  plan = "Free",
  ipAddress,
  deviceInfo,
  browser,
  status = "authorized",
}) {
  return {
    id: `download-log-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId,
    videoId,
    plan,
    ipAddress: ipAddress || "unknown",
    deviceInfo: deviceInfo || "unknown",
    browser: browser || "unknown",
    status,
    createdAt: new Date().toISOString(),
  };
}

function queueDownload({
  userId,
  videoId,
  plan = "Free",
  retryCount = 0,
  status = "queued",
}) {
  return {
    userId,
    videoId,
    plan,
    retryCount: Number(retryCount) || 0,
    status,
    createdAt: new Date().toISOString(),
  };
}

function retryDownload({ queue, retryCount = 0, status = "retrying", lastError = null }) {
  if (!queue) {
    return {
      retryCount: Number(retryCount) || 0,
      status,
      lastError,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    ...queue,
    retryCount: Number(retryCount) || queue.retryCount || 0,
    status,
    lastError,
    updatedAt: new Date().toISOString(),
  };
}

function resetDailyQuota(tracker) {
  if (!tracker) {
    return createQuotaTracker({ plan: "Free" });
  }

  return {
    ...tracker,
    usedToday: 0,
    lastResetAt: new Date().toISOString(),
  };
}

module.exports = {
  PLAN_LIMITS,
  createQuotaTracker,
  canDownloadVideo,
  logDownloadAttempt,
  queueDownload,
  retryDownload,
  resetDailyQuota,
};

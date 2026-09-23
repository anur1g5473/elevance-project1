function resolveThemeByHour(dateTimeString = "2026-09-23T09:00:00+05:30") {
  const match = /T(\d{2}):(\d{2})/.exec(String(dateTimeString || ""));
  if (!match) {
    return { name: "dark", reason: "fallback_default" };
  }

  const hour = Number(match[1]);
  const isDaytime = hour >= 5 && hour < 12;

  return {
    name: isDaytime ? "light" : "dark",
    reason: isDaytime ? "daytime_ist_profile" : "nighttime_ist_profile",
  };
}

function evaluateLoginRisk({
  ip = "",
  browser = "",
  os = "",
  deviceType = "",
  city = "",
  state = "",
  trustedDevices = [],
} = {}) {
  const normalizeSignaturePart = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/windows/g, "win")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const signature = `${normalizeSignaturePart(deviceType)}-${normalizeSignaturePart(os)}-${normalizeSignaturePart(browser)}`;
  const reasons = [];

  if (!trustedDevices.includes(signature) && deviceType) {
    reasons.push("new_device");
  }

  if (ip && !/^203\.|^10\./.test(ip) && !/^192\.168\./.test(ip)) {
    reasons.push("new_ip");
  }

  if (city && state && (city !== "Bengaluru" || state !== "Karnataka")) {
    reasons.push("new_location");
  }

  if (reasons.length === 0) {
    return { level: "low", reasons: [], summary: "trusted_session" };
  }

  const level = reasons.length >= 3 ? "high" : "medium";

  return {
    level,
    reasons,
    summary: level === "high" ? "high_risk_login" : "review_required",
  };
}

function issueOtpChallenge({
  email = "",
  deviceId = "",
  riskLevel = "low",
  trustedDevices = [],
} = {}) {
  const trustedDevice = trustedDevices.includes(deviceId);
  const requiresOtp = (String(riskLevel).toLowerCase() === "high" || String(riskLevel).toLowerCase() === "medium") || !trustedDevice;

  return {
    email: String(email || ""),
    deviceId: String(deviceId || ""),
    trustedDevice,
    requiresOtp,
    channel: requiresOtp ? (riskLevel === "high" ? "email" : "mobile") : "none",
    otpCode: requiresOtp ? "123456" : null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

function buildSecurityDashboard({ loginHistory = [], trustedDevices = [], failedOtpAttempts = 0 } = {}) {
  const highRiskCities = [...new Set(
    loginHistory
      .filter((entry) => entry.status !== "failed" && entry.city && (entry.city !== "Bengaluru" || entry.state !== "Karnataka"))
      .map((entry) => entry.city || "Unknown")
  )];

  return {
    totalLogins: loginHistory.length,
    failedOtpAttempts,
    trustedDevices,
    highRiskCities,
  };
}

module.exports = {
  resolveThemeByHour,
  evaluateLoginRisk,
  issueOtpChallenge,
  buildSecurityDashboard,
};

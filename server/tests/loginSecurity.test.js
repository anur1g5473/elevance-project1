const test = require("node:test");
const assert = require("node:assert/strict");
const {
  resolveThemeByHour,
  evaluateLoginRisk,
  issueOtpChallenge,
  buildSecurityDashboard,
} = require("../src/services/loginSecurity");

test("resolveThemeByHour applies the expected daytime and night theme profile for IST", () => {
  const dayTheme = resolveThemeByHour("2026-09-23T09:00:00+05:30");
  const nightTheme = resolveThemeByHour("2026-09-23T22:00:00+05:30");

  assert.equal(dayTheme.name, "light");
  assert.equal(nightTheme.name, "dark");
});

test("evaluateLoginRisk flags suspicious device, IP, and location changes as high risk", () => {
  const lowRisk = evaluateLoginRisk({
    ip: "203.0.113.9",
    browser: "Chrome",
    os: "Windows 11",
    deviceType: "desktop",
    city: "Bengaluru",
    state: "Karnataka",
    trustedDevices: ["desktop-win11-chrome"],
  });

  const highRisk = evaluateLoginRisk({
    ip: "196.14.10.42",
    browser: "Safari",
    os: "iOS 18",
    deviceType: "mobile",
    city: "Delhi",
    state: "Delhi",
    trustedDevices: ["desktop-win11-chrome"],
  });

  assert.equal(lowRisk.level, "low");
  assert.equal(highRisk.level, "high");
  assert.equal(highRisk.reasons.includes("new_ip"), true);
});

test("issueOtpChallenge requires OTP for risky login attempts and respects trusted devices", () => {
  const riskyChallenge = issueOtpChallenge({
    email: "user@example.com",
    deviceId: "mobile-iphone-14",
    riskLevel: "high",
    trustedDevices: ["desktop-win11-chrome"],
  });

  const trustedChallenge = issueOtpChallenge({
    email: "user@example.com",
    deviceId: "desktop-win11-chrome",
    riskLevel: "low",
    trustedDevices: ["desktop-win11-chrome"],
  });

  assert.equal(riskyChallenge.requiresOtp, true);
  assert.equal(trustedChallenge.requiresOtp, false);
  assert.equal(riskyChallenge.channel, "email");
});

test("buildSecurityDashboard summarizes login activity, trusted devices, and failed OTP events", () => {
  const dashboard = buildSecurityDashboard({
    loginHistory: [
      { userId: "u-1", city: "Bengaluru", status: "success" },
      { userId: "u-1", city: "Delhi", status: "success" },
      { userId: "u-1", city: "Mumbai", status: "failed" },
    ],
    trustedDevices: [
      { deviceId: "desktop-win11-chrome", name: "Primary laptop", expiresAt: "2099-01-01T00:00:00.000Z" },
    ],
    failedOtpAttempts: 2,
  });

  assert.equal(dashboard.totalLogins, 3);
  assert.equal(dashboard.failedOtpAttempts, 2);
  assert.equal(dashboard.trustedDevices.length, 1);
  assert.equal(dashboard.highRiskCities.includes("Delhi"), true);
});

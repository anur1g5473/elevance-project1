const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getPlanCatalog,
  getPlanByName,
  validateSubscription,
  createSubscriptionRecord,
  applySubscriptionLifecycle,
} = require("../src/services/subscriptionPlans");

test("getPlanCatalog returns the defined Free to Gold tiers with the expected limits and pricing", () => {
  const catalog = getPlanCatalog();

  assert.equal(catalog.Free.price, 0);
  assert.equal(catalog.Bronze.price, 199);
  assert.equal(catalog.Silver.price, 499);
  assert.equal(catalog.Gold.price, 999);
  assert.equal(catalog.Gold.features.includes("4K streaming"), true);
});

test("getPlanByName resolves the exact plan metadata and validity duration", () => {
  const plan = getPlanByName("Silver");

  assert.equal(plan.name, "Silver");
  assert.equal(plan.validityDays, 30);
  assert.equal(plan.features.includes("offline downloads"), true);
});

test("validateSubscription accepts active paid plans and rejects expired or missing subscriptions", () => {
  const active = validateSubscription({
    planName: "Gold",
    isActive: true,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  });

  const expired = validateSubscription({
    planName: "Bronze",
    isActive: true,
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
  });

  const missing = validateSubscription({
    planName: "Free",
    isActive: false,
    expiresAt: null,
  });

  assert.equal(active.allowed, true);
  assert.equal(expired.allowed, false);
  assert.equal(expired.reason, "subscription_expired");
  assert.equal(missing.allowed, false);
});

test("createSubscriptionRecord stores the billing metadata and preserves the plan history", () => {
  const record = createSubscriptionRecord({
    userId: "user-42",
    planName: "Silver",
    amount: 499,
    currency: "INR",
    status: "active",
    paymentId: "pay_123",
  });

  assert.equal(record.userId, "user-42");
  assert.equal(record.planName, "Silver");
  assert.equal(record.paymentId, "pay_123");
  assert.equal(record.billingHistory.length, 1);
});

test("applySubscriptionLifecycle upgrades or downgrades safely and preserves historical access rules", () => {
  const upgraded = applySubscriptionLifecycle({
    currentPlan: "Free",
    nextPlan: "Gold",
    isActive: true,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  });

  const downgraded = applySubscriptionLifecycle({
    currentPlan: "Gold",
    nextPlan: "Free",
    isActive: true,
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
  });

  assert.equal(upgraded.planName, "Gold");
  assert.equal(upgraded.action, "upgrade");
  assert.equal(downgraded.planName, "Free");
  assert.equal(downgraded.action, "downgrade");
});

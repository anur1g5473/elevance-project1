const PLAN_CATALOG = {
  Free: {
    name: "Free",
    price: 0,
    validityDays: 30,
    features: ["basic streaming", "limited downloads", "standard quality"],
    maxDownloadsPerDay: 1,
    maxDownloadsPerMonth: 30,
  },
  Bronze: {
    name: "Bronze",
    price: 199,
    validityDays: 30,
    features: ["ad-free", "offline downloads", "HD streaming"],
    maxDownloadsPerDay: 5,
    maxDownloadsPerMonth: 200,
  },
  Silver: {
    name: "Silver",
    price: 499,
    validityDays: 30,
    features: ["offline downloads", "priority support", "better streaming"],
    maxDownloadsPerDay: 12,
    maxDownloadsPerMonth: 300,
  },
  Gold: {
    name: "Gold",
    price: 999,
    validityDays: 30,
    features: ["4K streaming", "offline downloads", "priority access", "premium support"],
    maxDownloadsPerDay: 20,
    maxDownloadsPerMonth: 500,
  },
};

function getPlanCatalog() {
  return PLAN_CATALOG;
}

function getPlanByName(planName) {
  const plan = PLAN_CATALOG[planName];
  if (!plan) {
    return null;
  }

  return { ...plan };
}

function validateSubscription({ planName = "Free", isActive = false, expiresAt = null } = {}) {
  if (!isActive) {
    return { allowed: false, reason: "subscription_inactive" };
  }

  if (!expiresAt) {
    return { allowed: false, reason: "subscription_expired" };
  }

  const expirationTime = new Date(expiresAt).getTime();
  const now = Date.now();

  if (Number.isNaN(expirationTime) || expirationTime <= now) {
    return { allowed: false, reason: "subscription_expired" };
  }

  return {
    allowed: true,
    planName,
    expiresAt,
    reason: "ok",
  };
}

function createSubscriptionRecord({ userId, planName = "Free", amount = 0, currency = "INR", status = "active", paymentId = null }) {
  if (!userId) {
    return null;
  }

  const now = new Date().toISOString();
  const plan = getPlanByName(planName) || getPlanByName("Free");

  return {
    id: `subscription-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId,
    planName: plan.name,
    amount,
    currency,
    status,
    paymentId,
    startedAt: now,
    expiresAt: new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000).toISOString(),
    billingHistory: [{
      paymentId,
      amount,
      currency,
      status,
      createdAt: now,
    }],
  };
}

function applySubscriptionLifecycle({ currentPlan = "Free", nextPlan = "Free", isActive = true, expiresAt = null } = {}) {
  const current = getPlanByName(currentPlan) || getPlanByName("Free");
  const next = getPlanByName(nextPlan) || getPlanByName("Free");
  const isDowngrade = next.price < current.price || nextPlan === "Free";

  if (!isActive) {
    return {
      planName: "Free",
      action: "downgrade",
      status: "inactive",
    };
  }

  if (nextPlan === currentPlan) {
    return {
      planName: nextPlan,
      action: "renewal",
      status: "active",
      expiresAt,
    };
  }

  return {
    planName: next.name,
    action: isDowngrade ? "downgrade" : "upgrade",
    status: "active",
    expiresAt: expiresAt || new Date(Date.now() + next.validityDays * 24 * 60 * 60 * 1000).toISOString(),
  };
}

module.exports = {
  PLAN_CATALOG,
  getPlanCatalog,
  getPlanByName,
  validateSubscription,
  createSubscriptionRecord,
  applySubscriptionLifecycle,
};

# Feature 3 — Subscription Management

## Sub-tasks

- [ ] 3.1 Define plan catalog, pricing tiers, eligibility rules, and subscription schema
  - Add plan metadata for Free, Bronze, Silver, and Gold.
  - Capture validity, renewal, billing, and feature comparison rules.

- [ ] 3.2 Integrate Razorpay test checkout and secure payment verification
  - Handle successful, failed, and cancelled transactions.
  - Prevent duplicate payment attempts and verify before updating subscription status.

- [ ] 3.3 Implement subscription lifecycle automation
  - Activate features only after successful verification.
  - Downgrade expired subscriptions to Free while preserving historical user data.
  - Handle renewals, billing history, and schedule expiry cleanup.

- [ ] 3.4 Build subscription dashboard UX
  - Show current plan, remaining validity, next renewal date, billing history, and available premium features.
  - Support upgrade, downgrade, renew, and cancel flows.

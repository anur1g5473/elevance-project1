# Feature 5 — Login / Security

## Sub-tasks

- [ ] 5.1 Add theme personalization based on login time and profile persistence
  - Automatically apply light theme between 5:00 AM and 12:00 PM IST and dark otherwise.
  - Save user preference across devices and sessions.

- [ ] 5.2 Capture login metadata, device fingerprinting, and suspicious login detection
  - Record IP address, browser, OS, device type, login time, and approximate location.
  - Detect new browser, device, IP, city, or state for risk assessment.

- [ ] 5.3 Implement OTP verification flow and trusted-device rules
  - Require OTP for high-risk logins via email or mobile.
  - Add trusted-device expiry and verification logging.

- [ ] 5.4 Build security dashboard for login history and session review
  - Expose login history, failed OTP activity, and trusted devices in a user security page.
  - Support session review and device management.

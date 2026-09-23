# Elevance Project 1

Elevance is a multi-feature video platform prototype designed to demonstrate secure room creation, downloads, subscriptions, custom playback controls, login security, and multilingual comment experiences inside a single front-end dashboard.

## Overview

This project follows a sprint-driven delivery model where each feature is implemented in small, testable chunks and merged into the main branch once validated. The browser app exposes each feature through a visible tabbed UI so users can interact with the implemented product areas directly.

## Included feature areas

1. Video Calling
   - room creation and secure guest access
   - host validation and join-code safety checks
   - one-to-one call UI and participant controls
   - group-call readiness and call resilience rules

2. Download Management
   - daily and monthly quota tracking
   - plan-aware access checks
   - retry handling and download history logic

3. Subscription Management
   - multiple plan tiers and entitlement rules
   - lifecycle behavior for upgrades, downgrades, and renewals
   - plan metadata and validation checks

4. Custom Video Player
   - playback state management
   - quality, volume, and subtitle controls
   - PiP, theater mode, and resume-position logic

5. Login / Security
   - IST-based theme personalization
   - login-risk assessment and suspicious-login detection
   - OTP challenge handling and trusted-device rules
   - security summary dashboard model

6. Multilingual Comments
   - comment creation, replies, likes/dislikes, and sorting
   - moderation and report submission logic
   - translation support across multiple languages

## Tech stack

- Node.js + Express for the backend API and static hosting
- Vanilla HTML, CSS, and JavaScript for the UI shell
- Node.js built-in test runner for validation
- `.env` for configuration values

## Project structure

- `server/` — business logic, routes, and service modules
- `server/tests/` — validation tests for each domain feature
- `client/` — browser-view interface with feature tabs and interactions
- `daily-report.txt` — day-by-day delivery log and progress summary

## Setup

1. Install dependencies:
   npm install
2. Copy the example environment file:
   cp .env.example .env
3. Start the application:
   npm run dev
4. Open the app in the browser at:
   http://localhost:3000

## Current status

The project is in a merged, validated state for the implemented feature set. The client exposes each major feature in a browsable dashboard, and the project test suite is passing.

## Verification

The project has been validated using the existing Node test suite:

- `node --check client/app.js; npm test`
- Result: 45 tests passed, 0 failed

## Notes

This repository follows a sprint-style delivery workflow. Each feature chunk is implemented, validated, and merged before the next part of the platform is taken forward.

# Elevance Project 1

A capstone-level video streaming platform focused on secure real-time meeting rooms, video access controls, and modular feature delivery. The project is structured as a small full-stack application with a dedicated backend and a lightweight client shell.

## Tech stack

- Node.js + Express for the backend API
- Vanilla HTML/CSS/JavaScript for the frontend shell
- Node.js built-in test runner for fast API verification
- `.env` for secure configuration values and secrets

## Project structure

- `server/` — API routes, room/session logic, and business rules
- `client/` — browser interface for creating and joining rooms
- `server/tests/` — targeted backend verification tests

## Setup

1. Install dependencies:
   npm install
2. Copy the example environment file:
   cp .env.example .env
3. Start the application:
   npm run dev
4. Open the app in the browser at:
   http://localhost:3000

## Current milestone

### Task 1.1 — room/session models and secure call join flow

Implemented:
- room creation with unique room IDs, join codes, and host access tokens
- secure guest join flow with room code validation
- host authentication validation for protected meetings
- participant count limits and duplicate device checks
- API tests covering create-room, valid join, and invalid access handling

## Notes

This project follows a sprint-style delivery workflow. Each feature chunk is implemented, tested, and merged before moving to the next one.

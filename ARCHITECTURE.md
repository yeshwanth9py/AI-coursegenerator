# CourseAI Architecture

CourseAI uses a deliberately simple architecture:

```text
React frontend -> Express API -> MongoDB
                           -> Groq API
                           -> YouTube API
```

## Authentication

- Local and Auth0 users receive the same app session.
- Auth0 access tokens are validated through Auth0's `/userinfo` endpoint.
- The session token is stored in an HTTP-only cookie.
- Protected routes load the user before reading or changing courses.

## AI Request Protection

AI calls are more expensive and slower than normal API calls, so two small protections are used:

- `rateLimiter.js` limits API requests by IP address.
- `asyncQueue.js` limits how many Groq requests run at the same time.

Both are stored in memory. This is enough for one free-tier backend instance. If the app later runs on multiple backend instances, Redis would be useful for sharing this state.

## Frontend

- `App.jsx` defines public and protected routes.
- `utils/api.js` provides one Axios client for backend requests.
- Vite environment variables hold the public API URL and Auth0 configuration.
- The sidebar loads the user's available courses.

## Interview Summary

> I kept the architecture intentionally simple for the current scale. I added rate limiting and a small in-process queue specifically around expensive AI work. If usage grew, I would move queue and rate-limit state to Redis and run AI jobs in separate workers.

For the complete interview walkthrough, see [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md).

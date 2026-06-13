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

## AI Requests

- `groqService.js` contains the small amount of provider-specific request and error handling.
- `courseGeneration.js`, `lessonGeneration.js`, and `studyGeneration.js` keep each AI task focused.
- Lesson depth changes the requested content size. A short lesson is retried once.
- Flashcards and practice labs are generated on demand and are not stored.

## Learning Data

- Lesson documents store private notes, bookmarks, completion dates, recent activity, and quiz results.
- The dashboard derives progress and resume-learning information from those lesson records.
- Public course links use a separate read-only endpoint that excludes private learning data.
- Lesson pages fetch one full lesson plus a lightweight course outline instead of downloading every lesson body.

## Frontend

- `App.jsx` defines public and protected routes.
- `utils/api.js` provides one Axios client for backend requests.
- `utils/courseProgress.js` contains the shared progress calculations used by dashboards and certificates.
- Vite environment variables hold the public API URL and Auth0 configuration.

## Video Suggestions

- `youtubeService.js` searches the YouTube Data API using `YOUTUBE_API_KEY`.
- Video suggestions run directly from the lesson page and are appended to the lesson.

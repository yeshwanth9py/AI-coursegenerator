# CourseAI

CourseAI is a full-stack learning workspace that generates structured courses, multilingual lessons, quizzes, AI tutor responses, and relevant embedded videos.

The project is designed to demonstrate practical product engineering and system-design fundamentals without requiring paid infrastructure.

## Highlights

- React and Vite frontend with protected routes and responsive course navigation
- Express API with MongoDB persistence and ownership authorization
- Auth0 social login plus local email/password authentication
- HTTP-only cookie sessions and backend verification of Auth0 access tokens
- Groq-powered course, lesson, quiz, tutor, and video-query generation
- Custom in-memory rate limiter for API requests
- Small in-process queue that prevents too many simultaneous AI calls
- Multilingual lesson generation
- Lint, syntax-check, and production-build verification scripts

## Local Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the required backend secrets.
2. Copy `frontend/.env.example` to `frontend/.env` and fill in the public frontend configuration.
3. Install dependencies in both directories.
4. Start the backend with `npm start`.
5. Start the frontend with `npm run dev`.

```powershell
cd backend
npm install
npm start

cd ../frontend
npm install
npm run dev
```

## Verification

```powershell
cd backend
npm run check

cd ../frontend
npm run build
npm run lint
```

Automated test coverage is a current improvement area; see
[INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md#38-testing-strategy).

## Important Security Note

All `VITE_*` variables are public because Vite includes them in the browser bundle. Auth0 domain/client IDs and the API base URL are public configuration, not secrets.

Never put `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, or `YOUTUBE_API_KEY` in frontend environment files.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a short architecture summary.

See [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md) for an in-depth walkthrough,
tradeoffs, system-design improvements, and interview questions.

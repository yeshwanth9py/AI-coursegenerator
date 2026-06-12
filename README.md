# CourseAI

CourseAI generates structured courses, multilingual lessons, quizzes, tutor responses, and relevant videos.

## Highlights

- React and Vite frontend with protected routes
- Express API with MongoDB persistence and ownership authorization
- Auth0 social login plus local email/password authentication
- HTTP-only cookie sessions and backend verification of Auth0 access tokens
- Groq-powered course, lesson, quiz, and tutor generation
- AI-generated flashcards and practical lesson labs
- YouTube lesson video suggestions
- Straightforward persistence for generated modules and lessons
- Multilingual lesson generation
- Progress tracking, resume learning, bookmarks, notes, and quiz analytics
- Privacy-safe public course sharing
- Printable completion certificates

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
npm run lint

cd ../frontend
npm run build
npm run lint
```

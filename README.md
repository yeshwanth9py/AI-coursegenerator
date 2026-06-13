<div align="center">

# CourseAI

### Turn a learning goal into a complete, interactive course.

CourseAI generates structured course outlines, streams rich lessons as they are created, and gives every lesson its own tutor, quiz, flashcards, practice lab, notes, videos, and progress tracking.

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-111111?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-F55036)](https://groq.com/)
[![Auth0](https://img.shields.io/badge/Auth-Auth0-EB5424?logo=auth0&logoColor=white)](https://auth0.com/)

[Product](#product-tour) &middot; [Streaming](#engineering-highlight-ai-lesson-streaming) &middot; [Architecture](#architecture) &middot; [API](#api-snapshot) &middot; [Run Locally](#local-development)

</div>

---

## Why CourseAI?

Most AI learning tools stop after returning a wall of generated text. CourseAI treats generated content as a real learning experience:

- **Structured generation:** AI output is validated and converted into headings, paragraphs, code snippets, lists, and callouts.
- **Block-level streaming:** complete lesson blocks appear in the UI while the model is still generating the rest.
- **Active learning:** every lesson can produce quizzes, flashcards, practice labs, tutor answers, and relevant videos.
- **Persistent progress:** bookmarks, private notes, quiz analytics, recent activity, completion state, and certificates survive across sessions.
- **Privacy-aware sharing:** public course links expose learning content while excluding private notes and progress data.

## Product Tour

| Stage | Experience |
| --- | --- |
| **Create** | Describe a topic and receive a structured course containing modules and lessons. |
| **Learn** | Generate lessons at brief, standard, or deep detail levels in a chosen language. |
| **Explore** | Ask the lesson tutor questions, add YouTube videos, and save private notes. |
| **Practice** | Generate flashcards, five-question quizzes, and practical mini-projects on demand. |
| **Progress** | Resume recent lessons, track completion, bookmark content, and review quiz performance. |
| **Complete** | Unlock and print a personalized certificate after finishing every lesson. |
| **Share** | Publish a read-only course link without exposing personal learning data. |

## Engineering Highlight: AI Lesson Streaming

CourseAI does not wait for the model to finish an entire lesson before showing content. It streams **semantic lesson blocks** from the AI provider to the browser.

```mermaid
sequenceDiagram
    participant U as Learner
    participant R as React Client
    participant E as Express API
    participant G as Groq API
    participant M as MongoDB

    U->>R: Generate lesson
    R->>E: POST /lessons/:id/enrich-stream
    E->>G: Start streamed completion
    loop As each JSON block completes
        G-->>E: Text chunk
        E->>E: Parse and validate complete block
        E-->>R: SSE block event
        R->>R: Append block to lesson state
    end
    E->>M: Save completed lesson
    E-->>R: SSE done event
```

The model is prompted to return a structured `contentBlocks` array. The backend consumes the provider stream as an async iterator, tracks JSON braces and string boundaries, extracts each complete object, validates it, and forwards it immediately as a Server-Sent Event.

This gives the responsiveness of token streaming while keeping the frontend renderer predictable and type-aware.

Key implementation files:

- [`backend/services/groqService.js`](backend/services/groqService.js) handles provider-specific streaming and errors.
- [`backend/services/lessonGeneration.js`](backend/services/lessonGeneration.js) incrementally parses and validates structured blocks.
- [`backend/controllers/courseAiController.js`](backend/controllers/courseAiController.js) sends `block`, `done`, and `error` events.
- [`frontend/src/pages/LessonViewerPage.jsx`](frontend/src/pages/LessonViewerPage.jsx) reads and decodes the response stream.
- [`frontend/src/components/lesson/LessonRenderer.jsx`](frontend/src/components/lesson/LessonRenderer.jsx) renders each semantic block.

## Architecture

```mermaid
flowchart LR
    Browser["React + Vite Client"]
    API["Express API"]
    Auth["JWT Sessions + Auth0"]
    DB[("MongoDB")]
    AI["Groq API"]
    Video["YouTube Data API"]

    Browser -->|REST + streamed responses| API
    API --> Auth
    API --> DB
    API --> AI
    API --> Video
```

The codebase separates HTTP concerns, domain logic, provider integrations, and persistence:

```text
AI-coursegenerator/
|-- frontend/
|   |-- src/components/       Reusable UI and lesson tools
|   |-- src/pages/            Route-level screens
|   |-- src/hooks/            Authentication state
|   `-- src/utils/            API client and progress calculations
|-- backend/
|   |-- controllers/          Request validation and responses
|   |-- middlewares/          Sessions, Auth0 verification, errors
|   |-- models/               Mongoose data models
|   |-- routes/               Public and protected API routes
|   `-- services/             AI, persistence, access, and video logic
|-- ARCHITECTURE.md
`-- README.md
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for additional implementation notes.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, React Router, Vite, Tailwind CSS, Axios, React Markdown, Lucide |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB |
| **AI** | Groq SDK with structured and streamed completions |
| **Authentication** | Local email/password, bcrypt, Auth0, JWT, HTTP-only cookies |
| **External API** | YouTube Data API |

## Security And Data Design

- Protected course routes require a valid HTTP-only session cookie.
- Auth0 access tokens are verified on the backend before creating an app session.
- Every private course and lesson operation checks resource ownership.
- Passwords are hashed with bcrypt before persistence.
- Request values are normalized, length-limited, and validated before use.
- Public sharing uses a random share ID and a separate read-only projection.
- Shared courses exclude private notes, bookmarks, activity, quiz results, and completion state.
- Provider and database secrets stay in backend environment variables.

## API Snapshot

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a local account and session |
| `POST` | `/api/auth/login` | Start a local session |
| `POST` | `/api/auth/auth0-sync` | Verify Auth0 identity and start an app session |
| `POST` | `/api/courses/generate` | Generate and persist a course outline |
| `GET` | `/api/courses/mine` | Load the authenticated learner's courses |
| `POST` | `/api/courses/lessons/:id/enrich-stream` | Stream a generated lesson |
| `PATCH` | `/api/courses/lessons/:id/progress` | Save notes, bookmarks, activity, or completion |
| `POST` | `/api/courses/lessons/:id/generate-quiz` | Generate a lesson quiz |
| `POST` | `/api/courses/lessons/:id/flashcards` | Generate a flashcard deck |
| `POST` | `/api/courses/lessons/:id/practice-lab` | Generate an applied mini-project |
| `POST` | `/api/courses/lessons/:id/chat` | Ask the lesson-aware AI tutor |
| `GET` | `/api/public/courses/:shareId` | Read a privacy-safe shared course |

## Local Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB database
- Groq API key
- Auth0 application for social login
- YouTube Data API key for video suggestions

### 1. Clone The Repository

```bash
git clone https://github.com/yeshwanth9py/AI-coursegenerator.git
cd AI-coursegenerator
```

### 2. Configure Environment Variables

Create local environment files from the included templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend configuration:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/courseai
JWT_SECRET=replace-with-a-long-random-secret
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
AUTH0_DOMAIN=your-tenant.auth0.com
YOUTUBE_API_KEY=your-youtube-data-api-key
```

Frontend configuration:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-public-auth0-client-id
```

Never place database URLs, JWT secrets, or provider secret keys in `VITE_*` variables. Vite includes those variables in the browser bundle.

### 3. Install And Run

Start the API:

```bash
cd backend
npm install
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Verification

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
npm run build
```

## Design Decisions

- **SSE-style streaming over WebSockets:** lesson generation only needs one-way server-to-client updates, so a streamed HTTP response keeps the protocol focused.
- **`fetch` for lesson streaming, Axios elsewhere:** Fetch exposes the browser `ReadableStream` API directly, while Axios remains convenient for normal JSON requests.
- **Structured blocks over raw Markdown:** block types make lessons consistently renderable, independently validatable, and easy to extend.
- **Generate study tools on demand:** flashcards and labs do not inflate lesson documents when learners never request them.
- **Separate public projection:** privacy is enforced by the backend response shape instead of relying on the frontend to hide fields.
- **Final persistence after streaming:** users see incremental progress, while the database stores only the completed lesson as the canonical version.

## Future Improvements

- Add automated controller, service, and streaming parser tests.
- Support cancellation with `AbortController` when learners leave during generation.
- Add background jobs and resumable generation for long-running lessons.
- Add provider-independent AI adapters and usage analytics.
- Add downloadable PDF generation and certificate verification IDs.

---

<div align="center">

Built as a full-stack exploration of structured AI generation, streaming UX, secure persistence, and active learning.

</div>

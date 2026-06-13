<div align="center">

# 🎓 CourseAI

**Turn a learning goal into a complete, interactive course.**

CourseAI generates structured course outlines, streams rich lessons as they are created, and gives every lesson its own tutor, quiz, flashcards, practice lab, notes, videos, and progress tracking.

[![Watch Live Demo](https://img.shields.io/badge/Watch-Live_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/PB9uZic8KMg)

[![React](https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-111111?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-F55036?style=flat-square)](https://groq.com/)
[![Auth0](https://img.shields.io/badge/Auth-Auth0-EB5424?style=flat-square&logo=auth0&logoColor=white)](https://auth0.com/)

[Why CourseAI?](#why-courseai) &middot; [Product Tour](#product-tour) &middot; [Streaming Architecture](#engineering-highlight-ai-lesson-streaming) &middot; [API](#api-snapshot) &middot; [Local Development](#local-development)

</div>

---

## Why CourseAI?

Most AI learning tools stop after returning a wall of generated text. CourseAI treats generated content as a comprehensive, real-world learning experience:

* **Structured Generation:** AI output is strictly validated and converted into proper headings, paragraphs, code snippets, lists, and callouts.
* **Block-Level Streaming:** Complete lesson blocks dynamically appear in the UI while the model is still generating the rest of the content behind the scenes.
* **Active Learning:** Every lesson allows users to generate quizzes, flashcards, practice labs, ask a tutor, and fetch relevant supplementary videos.
* **Persistent Progress:** Bookmarks, private notes, quiz analytics, recent activity, completion state, and certificates survive across sessions.
* **Privacy-Aware Sharing:** Public course links securely expose learning content while completely excluding private notes and progress data.

---

## Product Tour

> 🎥 **[Click here to watch the full video explanation and demo](https://youtu.be/PB9uZic8KMg)**

| Stage | Experience |
| :--- | :--- |
| **Create** | Describe a topic and receive a structured course containing modules and lessons. |
| **Learn** | Generate lessons at brief, standard, or deep detail levels in your chosen language. |
| **Explore** | Ask the lesson tutor questions, add YouTube videos, and save private notes. |
| **Practice** | Generate flashcards, five-question quizzes, and practical mini-projects on demand. |
| **Progress** | Resume recent lessons, track completion, bookmark content, and review quiz performance. |
| **Complete** | Unlock and print a personalized certificate after finishing every lesson. |
| **Share** | Publish a read-only course link without exposing personal learning data. |

---

## Engineering Highlight: AI Lesson Streaming

CourseAI does not wait for the model to finish an entire lesson before rendering content. Instead, it streams **semantic lesson blocks** directly from the AI provider to the browser.

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

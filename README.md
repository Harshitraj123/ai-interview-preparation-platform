AI Interview Preparation Platform

An AI-assisted interview practice platform designed to help candidates prepare for technical and behavioral interviews through role-specific questions, structured feedback, and progress tracking.

Project status: In development. The React/Vite frontend and Express backend scaffolds have been created. Interview generation, answer evaluation, persistence, authentication, and analytics are planned features and should be treated as incomplete until implemented and tested.

Overview

Preparing for interviews can be fragmented: candidates often practise questions without consistent feedback or a clear way to track improvement. This project aims to bring practice, feedback, and preparation into one full-stack application.

The goal is to build a maintainable application with a React interface, a Node.js/Express API, MongoDB persistence, and Google Gemini integration for AI-assisted interview workflows.

Planned Features

Role-specific practice — select a target role, experience level, and interview topic.

AI-generated questions — generate questions tailored to a selected role and skill area.

Structured answer feedback — provide feedback on relevance, clarity, technical correctness, and completeness.

Interview sessions — work through a question set in a focused practice flow.

Session history — save previous interviews and review feedback.

Progress insights — identify recurring strengths and topics for further study.

Account management — support user registration, sign-in, and personal interview history.

These are planned product capabilities, not a claim that every feature is currently implemented.

Technology Stack

Layer

Technology

Intended use

Frontend

React + Vite

Interactive user interface and development server

Routing

React Router

Client-side navigation

HTTP client

Axios

Requests from the frontend to the backend API

Backend

Node.js + Express

REST API and application logic

Database

MongoDB + Mongoose

Persistence for users and interview sessions

AI integration

Google GenAI SDK

AI-assisted question generation and feedback

Configuration

dotenv

Local environment configuration

API protection

Helmet, CORS, express-rate-limit

Security-related middleware to configure and verify

Architecture

The intended request flow is:

flowchart TD
    U[Candidate] --> FE[React + Vite frontend]
    FE -->|HTTP / JSON| API[Express REST API]
    API --> AI[Google Gemini API]
    API <--> DB[(MongoDB via Mongoose)]
    AI --> API
    API --> FE

This diagram describes the planned architecture. The integrations must be completed and tested before the full flow can be considered operational.

Repository Structure

ai-interview-preparation-platform/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── package.json
│   └── server.js          # backend entry point to implement
└── README.md

The directory tree is a simplified overview. It will evolve as application modules, routes, models, and tests are added.

Getting Started

Prerequisites

Node.js and npm

A MongoDB instance or MongoDB Atlas database for persistence (once database integration is implemented)

A Google Gemini API key for AI features (once the AI integration is wired up)

1. Install frontend dependencies

cd frontend
npm install

2. Start the frontend

npm run dev

Vite prints the local development URL in the terminal (commonly http://localhost:5173).

3. Install backend dependencies

Open another terminal at the project root:

cd backend
npm install

The backend package is configured with a development script that expects backend/server.js. Implement the Express entry point and required environment configuration before running npm run dev.

Environment Configuration

Keep credentials in local environment files and never commit them. When backend configuration is implemented, document the exact variables in an .env.example file. Expected configuration will likely include values for the API port, MongoDB connection string, and Gemini API key; the final names should match the implementation.

Example placeholders for planning only:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_interview_preparation
GEMINI_API_KEY=replace_with_your_key

Do not put real secrets in this README or commit an actual .env file.

Development Roadmap

Implement the Express application and health-check endpoint.

Configure environment validation and MongoDB connectivity.

Design data models for users and interview sessions.

Implement role- and topic-based question generation.

Implement structured answer evaluation and failure handling.

Connect frontend screens to the API.

Add authentication and authorization.

Add interview history and progress summaries.

Add input validation, rate limits, and appropriate security controls.

Add automated tests for API routes and core logic.

Verify production build and document deployment steps.

Testing and Quality

Testing is not yet documented as implemented. As features are added, include automated tests for API validation, error handling, AI response parsing, persistence, and important frontend flows. Record real test results here only after running them.

Security Notes

Never commit API keys, database credentials, session secrets, or local .env files.

Validate all client-provided input on the server.

Apply authentication and authorization checks to user-specific records.

Treat AI output as untrusted input; validate structured output before using or storing it.

Configure CORS and rate limiting for the intended deployment environment.

Contributing

This is a personal learning and portfolio project under active development. For proposed changes, describe the problem, the implementation, and how it was tested.

Author

Harshit Raj
Computer Science & Engineering | Full-Stack Development | AI/ML

GitHub: [AI Interview Preparation Platform](https://github.com/Harshitraj123/ai-interview-preparation-platform)

LinkedIn: harshitraj010204

License

A project license has not yet been added. Decide the applicable license before publishing the repository, and ensure it covers only code and assets you have the right to license.
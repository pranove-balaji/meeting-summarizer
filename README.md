# Meeting Summarizer

An end-to-end meeting transcription and summarization application built with **FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic, Sarvam AI, Gemini, and a modern frontend**.

The project takes an uploaded meeting audio file, transcribes it using Sarvam AI, summarizes the transcript using Gemini, stores the complete result in PostgreSQL, and exposes the processed meeting through REST APIs for the frontend.

---

## 🎯 Project Goal

The goal was to build a practical backend pipeline for turning a meeting recording into useful, structured information.

### User flow

```text
User
 │
 │ Upload meeting audio
 ▼
Frontend
 │
 │ POST /api/v1/meetings
 ▼
FastAPI
 │
 │ Validate + store audio
 ▼
PostgreSQL
 │
 │ Meeting record created
 ▼
Background Task
 │
 ├──► Sarvam AI
 │       │
 │       └──► Audio → Transcript
 │
 ├──► Gemini
 │       │
 │       └──► Transcript → Summary
 │
 └──► PostgreSQL
         │
         ├── Transcript
         ├── Summary
         ├── Key points
         └── Action items
                 │
                 ▼
              Frontend
```

---

![mockframe](frontend\src\assets\mock.png)

# ✨ Features Implemented

- 🎙️ Audio meeting upload
- 📁 Local audio file storage
- 📏 File size validation
- 🎵 Audio extension validation
- 🗄️ PostgreSQL database integration
- 🔄 Meeting status tracking
- ⚙️ Background processing
- 🗣️ Sarvam AI speech-to-text
- 👥 Sarvam batch transcription for recordings longer than the direct API limit
- 🤖 Gemini-powered meeting summarization
- 📝 Structured summaries
- 📌 Key point extraction
- ✅ Action item extraction
- 👤 Optional action-item assignee
- 📅 Optional action-item deadline
- 📄 Transcript persistence
- 🔎 Meeting/result retrieval APIs
- 🧱 Database migrations with Alembic
- 📦 Pydantic request/response schemas
- 🌐 REST API integration with the frontend

---

# 🏗️ Architecture

The backend follows a layered architecture rather than putting all logic inside FastAPI routes.

```text
Frontend
   │
   ▼
API Layer
   │
   ▼
Service Layer
   │
   ├── Meeting Service
   ├── Processing Service
   ├── Transcription Service
   └── Summarization Provider
   │
   ▼
External Services
   │
   ├── Sarvam AI
   └── Gemini
   │
   ▼
Database Layer
   │
   ├── SQLAlchemy
   └── PostgreSQL
```

This separation makes the application easier to understand, test, maintain, and extend.

---

# 📂 Important Backend Structure

```text
backend/
│
├── app/
│   ├── api/
│   │   └── meetings.py
│   │
│   ├── constants/
│   │   └── meeting.py
│   │
│   ├── core/
│   │   └── config.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── dependencies.py
│   │
│   ├── models/
│   │   ├── meeting.py
│   │   ├── transcript.py
│   │   └── meeting_result.py
│   │
│   ├── schemas/
│   │   ├── meeting.py
│   │   └── summary.py
│   │
│   ├── services/
│   │   ├── meeting_service.py
│   │   ├── processing_service.py
│   │   ├── meeting_status.py
│   │   ├── transcription/
│   │   │   ├── base.py
│   │   │   ├── service.py
│   │   │   └── sarvam.py
│   │   └── summarization/
│   │       └── gemini.py
│   │
│   └── tasks/
│       └── meeting_tasks.py
│
├── alembic/
│   └── versions/
│
├── storage/
│   ├── uploads/
│   └── transcription_results/
│
└── requirements.txt
```

---

# 🔄 Complete Processing Pipeline

## 1. Upload

The frontend sends the audio file to:

```http
POST /api/v1/meetings
```

The backend:

1. Checks that a file was provided.
2. Checks the audio extension.
3. Checks the maximum file size.
4. Generates a UUID for the meeting.
5. Stores the file.
6. Creates a meeting record in PostgreSQL.
7. Starts background processing.
8. Immediately returns the meeting ID and status.

Example response:

```json
{
  "id": "b2e206b0-9502-4feb-a81e-a20ad785d313",
  "filename": "meeting.mp3",
  "status": "uploaded"
}
```

---

# ⚙️ Background Processing

We used FastAPI's `BackgroundTasks` so that the upload request does not have to wait for the entire AI pipeline.

```text
Upload request
      │
      ├── Save file
      ├── Save database record
      │
      └── Return response
              │
              ▼
       Background processing
              │
              ├── Transcription
              ├── Summarization
              └── Result storage
```

This is important because transcription and LLM summarization can take significantly longer than a normal API request.

---

# 🗣️ Transcription with Sarvam AI

Initially, the direct Sarvam speech-to-text API was used.

During testing, we discovered that the direct transcription endpoint has a duration limitation:

```text
Audio duration exceeds the maximum limit of 30 seconds.
```

Instead of limiting our application to short meetings, we changed the implementation to use the **Sarvam batch speech-to-text job API**.

The flow became:

```text
Audio file
    ↓
Create Sarvam transcription job
    ↓
Upload audio
    ↓
Start job
    ↓
Wait for completion
    ↓
Download output JSON
    ↓
Extract transcript
    ↓
Save transcript
```

The batch output contained the transcript in JSON, for example:

```json
{
  "request_id": "...",
  "transcript": "So it is the SEC..."
}
```

The application extracts the `transcript` field and passes it to the next stage.

---

# 🤖 Gemini Summarization

After transcription, the transcript is sent to Gemini.

The pipeline is:

```text
Transcript
    ↓
Gemini
    ↓
MeetingSummary
    ├── summary
    ├── key_points
    └── action_items
```

The structured output is represented using Pydantic.

```python
class MeetingSummary(BaseModel):
    summary: str
    key_points: list[str]
    action_items: list[ActionItem]
```

Each action item contains:

```python
class ActionItem(BaseModel):
    task: str
    assignee: str | None = None
    deadline: str | None = None
```

This gives the application a predictable structure instead of receiving an unstructured block of AI-generated text.

---

# 🧠 Why Pydantic?

One of the important concepts learned in this project was the role of Pydantic.

Pydantic is primarily used for:

- Data validation
- Data serialization
- Defining data contracts
- Structuring API requests and responses
- Integrating with FastAPI

For example:

```python
class MeetingResultResponse(BaseModel):
    id: str
    meeting_id: str
    transcript: str
    summary: str
    key_points: list[str]
    action_items: list[ActionItem]
```

This tells FastAPI exactly what the API response should look like.

### Simple mental model

```text
Pydantic
   ↓
"Does this data have the structure we expect?"
```

Whereas:

```text
SQLAlchemy
   ↓
"How do we communicate with the database?"
```

And:

```text
PostgreSQL
   ↓
"Where do we permanently store the data?"
```

---

# 🗄️ PostgreSQL + SQLAlchemy

PostgreSQL is the persistent storage layer.

The application stores meeting information and generated results in the database.

The main result data contains:

```text
id
meeting_id
transcript
summary
key_points
action_items
created_at
updated_at
```

SQLAlchemy provides the ORM layer between Python and PostgreSQL.

Instead of writing raw SQL for every operation, we work with Python models and SQLAlchemy sessions.

---

# 🔄 Meeting Status Flow

Meetings move through a controlled lifecycle.

```text
uploaded
   ↓
processing
   ↓
transcribed
   ↓
summarizing
   ↓
completed
```

If something fails:

```text
processing ──► failed
transcribing ──► failed
summarizing ──► failed
```

The project uses status-transition validation so invalid state changes are not silently allowed.

This makes the processing pipeline easier to reason about and debug.

---

# 🧱 Database Migrations with Alembic

Alembic is used to manage database schema changes.

For example, when the `meeting_results` table was introduced, an Alembic migration was created:

```text
alembic/
└── versions/
    └── create_meeting_results_table.py
```

Instead of manually modifying the database every time the schema changes, migrations provide a reproducible way to evolve the database.

---

# 🌐 API Endpoints

## Upload Meeting

```http
POST /api/v1/meetings
```

Uploads an audio file and starts background processing.

---

## Get Meeting

```http
GET /api/v1/meetings/{meeting_id}
```

Returns the current meeting status.

Example:

```json
{
  "id": "...",
  "filename": "meeting.mp3",
  "status": "completed"
}
```

---

## Get Meeting Result

```http
GET /api/v1/meetings/{meeting_id}/result
```

Returns:

- Transcript
- Summary
- Key points
- Action items

Example structure:

```json
{
  "id": "...",
  "meeting_id": "...",
  "transcript": "...",
  "summary": "...",
  "key_points": [
    "Team discussed project progress",
    "Security requirements were reviewed"
  ],
  "action_items": [
    {
      "task": "Complete security review",
      "assignee": "John",
      "deadline": "Next week"
    }
  ]
}
```

---

# 🔌 Frontend ↔ Backend Flow

The frontend does not need to know how Sarvam or Gemini works.

It communicates only with our API.

```text
                    Backend
                       │
Frontend               │
   │                   │
   │ POST audio        │
   ├──────────────────►│
   │                   │
   │◄── meeting ID ────┤
   │                   │
   │                   │
   │ GET meeting       │
   ├──────────────────►│
   │                   │
   │◄── status ────────┤
   │                   │
   │                   │
   │ GET result        │
   ├──────────────────►│
   │                   │
   │◄── summary ───────┤
```

The frontend can therefore display:

```text
Uploading
    ↓
Processing
    ↓
Transcribing
    ↓
Summarizing
    ↓
Completed
    ↓
Show Meeting Summary
```

---

# 🧩 Important Design Decisions

## Provider abstraction

The transcription service uses a provider interface rather than tightly coupling the entire application to Sarvam.

Conceptually:

```text
TranscriptionService
        │
        ▼
TranscriptionProvider
        │
        └── SarvamTranscriptionProvider
```

This means the application can potentially support another transcription provider later without rewriting the processing pipeline.

For example:

```text
TranscriptionProvider
      ├── Sarvam
      ├── Whisper
      └── AnotherProvider
```

The same idea is useful for summarization providers.

---

# 🛡️ Error Handling

The processing pipeline is wrapped with error handling.

If an external service fails:

```text
Sarvam/Gemini error
       ↓
Rollback database transaction
       ↓
Meeting marked as failed
       ↓
Error propagated/logged
```

We also encountered and resolved real integration problems during development, including:

- Incorrect PostgreSQL database/container assumptions
- Missing `psql` on Windows PATH
- Sarvam direct API duration limitation
- Incorrect batch API method
- Batch result parsing
- AI processing delays
- Meetings remaining in `processing`
- Database result verification
- Duplicate/incorrect code during service refactoring

These were useful parts of the implementation because they exposed how an actual backend behaves outside of a simple tutorial.

---

# 🧪 Testing and Debugging

During development, individual services were tested independently before integrating the complete pipeline.

The project verified:

```text
Database connection
       ↓
Meeting upload
       ↓
Sarvam transcription
       ↓
Transcript persistence
       ↓
Gemini summarization
       ↓
Meeting result persistence
       ↓
API retrieval
       ↓
Frontend consumption
```

A successful run produced logs similar to:

```text
Transcription completed.
Transcript received: 25238 characters
Starting Gemini summarization...
Gemini summarization completed.
Meeting result saved.
Meeting completed successfully.
```

---

# 📚 What We Learned

This project was not only about building a meeting summarizer. It was also a practical introduction to how a real backend application is structured.

### FastAPI

Learned:

- REST API creation
- Routers
- Dependency injection
- `UploadFile`
- `BackgroundTasks`
- Response models
- HTTP status codes

### Pydantic

Learned:

- Schema definition
- Type validation
- Nested models
- Optional fields
- Serialization with `model_dump()`
- API response contracts

### SQLAlchemy

Learned:

- ORM concepts
- Models
- Sessions
- Queries
- Transactions
- Database persistence

### PostgreSQL

Learned:

- Database creation
- Tables
- UUIDs
- JSONB
- Querying records
- Inspecting application state directly

### Alembic

Learned:

- Database migrations
- Schema evolution
- Migration files
- Keeping application and database schemas synchronized

### External AI APIs

Learned:

- API authentication
- Provider integration
- API limitations
- Batch processing
- Handling external API failures
- Parsing AI-generated output
- Connecting multiple AI services into a pipeline

### Backend Architecture

Learned why it is useful to separate:

```text
API
 ↓
Service
 ↓
Provider
 ↓
Database / External API
```

instead of putting everything inside a route function.

---

# 🧠 The Biggest Concept We Learned

The most important lesson from this project was understanding that a backend is not just:

```text
Frontend → Database
```

A real application often looks more like:

```text
                    ┌───────────────┐
                    │   Frontend    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    FastAPI    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Services   │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │  Sarvam AI  │             │   Gemini    │
       └─────────────┘             └─────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

Each component has one main responsibility.

That separation makes the system easier to debug, replace, test, and scale.

---

# 🚀 Running the Backend

Create and activate the virtual environment:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Configure environment variables for:

```text
DATABASE_URL
SARVAM_API_KEY
GEMINI_API_KEY
```

Run database migrations:

```powershell
alembic upgrade head
```

Start the FastAPI application:

```powershell
uvicorn app.main:app --reload
```

API documentation is available through FastAPI's generated Swagger UI.

---

# 🔐 Environment Variables

API keys and database credentials should not be committed to Git.

Example:

```env
DATABASE_URL=postgresql://meeting_user:password@localhost:5432/meeting_summarizer
SARVAM_API_KEY=your_sarvam_key
GEMINI_API_KEY=your_gemini_key
```

Use a `.env` file locally and keep it out of version control.

---

# 🐳 PostgreSQL with Docker

PostgreSQL was run using Docker during development.

The database container exposed PostgreSQL on:

```text
localhost:5432
```

This allowed the application running on Windows to communicate with PostgreSQL inside Docker.

---

# 📈 Future Improvements

The current implementation provides the complete core workflow.

Potential improvements include:

- Redis/Celery or another dedicated job queue for production workloads
- Cloud object storage for uploaded audio
- Authentication and authorization
- Meeting history and pagination
- Retry mechanisms for temporary AI/API failures
- More detailed processing statuses
- WebSocket/SSE status updates
- Automated tests
- Dockerized backend deployment
- Production monitoring and logging
- Rate limiting
- Better transcript segmentation and speaker-aware summaries

These are extensions rather than requirements of the current implementation.

---

# 🏁 Final Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│                                                         │
│ Upload → Processing Status → Summary → Action Items     │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       FASTAPI                           │
│                                                         │
│                  API / Validation                       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                        │
│                                                         │
│ Meeting Service → Processing Service                    │
│                        │                                │
│              ┌─────────┴─────────┐                      │
│              ▼                   ▼                      │
│        Transcription       Summarization                │
│          Service              Service                   │
└──────────────┬──────────────────┬────────────────────────┘
               │                  │
               ▼                  ▼
        ┌─────────────┐    ┌─────────────┐
        │  Sarvam AI  │    │   Gemini    │
        └─────────────┘    └─────────────┘
               │                  │
               └────────┬─────────┘
                        ▼
                ┌───────────────┐
                │  PostgreSQL   │
                │   + JSONB     │
                └───────────────┘
```

---

## 💡 Project Takeaway

The core idea is simple:

> **Turn unstructured meeting audio into structured, searchable, actionable information.**

But implementing it taught the complete journey of a modern backend:

**file upload → validation → persistence → background processing → external AI integration → structured data validation → database storage → REST API → frontend consumption.**

That end-to-end understanding is the main outcome of this project.

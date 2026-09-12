# ArchVoice — AI Conversational Project Assistant for AEC

> **ArchScale Guild Hackathon Project**  
> **Problem Statement AS-03**: *“What if you could talk to your project?”*

ArchVoice is a full-stack, voice-enabled AI project management assistant built specifically for Architecture, Engineering, and Construction (AEC) project teams. Instead of manually navigating through complex spreadsheets, drawing revisions, and task boards, project managers and site engineers can simply **talk to their project** using natural language to query status, find overdue tasks or pending approvals, and directly execute database actions (like task creation and status updates).

---

## 🏛️ Problem We Solve

In AEC projects (Commercial Towers, Residential Complexes, Infrastructure), critical project data is fragmented across:
- Electrical, HVAC, Structural, and Civil drawing sign-offs
- Overdue tasks and vendor deadlines
- Pending approvals from clients and municipal authorities
- Document vaults (DWG layout drawings, BOQs, BIM models)

**ArchVoice** replaces manual navigation with a single conversational voice interface that:
1. Translates natural language speech/text into structured intents and entities.
2. Interrogates an active SQLite project database safely (preventing raw SQL injection).
3. Renders rich, interactive UI response cards (Task cards, Approval widgets, Project metrics).
4. **Takes real database actions** (e.g., creating tasks, updating statuses, sending reminders) with instant dynamic updates across the dashboard.

---

## ⚡ Key Features

- 🎙 **Voice-First Experience**: Web Speech API integration (`SpeechRecognition` / `webkitSpeechRecognition`) with visual audio wave animations and Text-to-Speech (TTS) response readout.
- 🧠 **Structured AI Intent System**: Safely classifies requests into 10+ controlled intents (`GET_PROJECT_STATUS`, `GET_OVERDUE_TASKS`, `GET_PENDING_APPROVALS`, `GET_TEAM_MEMBER`, `CREATE_TASK`, `UPDATE_TASK`, `CREATE_REMINDER`).
- 🛡️ **Fail-Safe Demo Mode**: Features a built-in local regex/rule fallback engine so the application works 100% reliably during hackathon judging even without an active LLM API key.
- 🗄️ **Real Database Operations**: SQLite via Prisma ORM pre-seeded with realistic AEC data (3 projects, 10 team members, 22 tasks, 9 approvals, 10 document metadata records).
- 📊 **Executive Dashboard**: Live AEC project progress metrics using Recharts, urgent overdue task lists, and activity streams.
- 🏗️ **Project Context Switching**: Filter queries by **Project Alpha**, **Project Horizon**, **Project Nova**, or **All Projects**.

---

## 📐 Architecture Diagram

```mermaid
flowchart TD
    User([User Speech / Text Query]) --> VoiceUI[Web Speech Recognition & Chat Input]
    VoiceUI --> Client[React + Vite Frontend]
    Client --> API[Express.js REST API Server]
    API --> IntentEngine{AI Intent Parser}
    IntentEngine -->|Gemini API Available| Gemini[Gemini 1.5/2.5 Flash Model]
    IntentEngine -->|No API Key / Error| Fallback[Local Demo Fallback Engine]
    Gemini --> StructuredJSON[{Intent & Entity Output}]
    Fallback --> StructuredJSON
    StructuredJSON --> ActionExecutor[Safe Backend Action Handler]
    ActionExecutor --> Prisma[(SQLite Database via Prisma ORM)]
    Prisma --> ActionExecutor
    ActionExecutor --> JSONResponse[JSON Response + Visual Widget Payload]
    JSONResponse --> Client
    Client --> VisualWidgets[Render Interactive UI Cards & Update Dashboard]
    Client --> TTS[SpeechSynthesis Readout]
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: SQLite (`dev.db`)
- **AI & Voice**: Google Gemini Generative AI SDK (`@google/generative-ai`) + Web Speech API (SpeechRecognition & SpeechSynthesis) + Rule-Based Fallback Engine

---

## 📊 Database Schema

```prisma
model Project {
  id          String     @id @default(uuid())
  name        String
  client      String
  location    String
  status      String     @default("In Progress")
  progress    Int        @default(0)
  startDate   DateTime
  dueDate     DateTime
  tasks       Task[]
  approvals   Approval[]
  documents   Document[]
  activities  Activity[]
}

model User {
  id        String   @id @default(uuid())
  name      String
  role      String
  email     String   @unique
  avatar    String?
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  projectId   String
  assignedTo  String
  status      String   @default("Pending")
  priority    String   @default("Medium")
  dueDate     DateTime
}

model Approval {
  id          String   @id @default(uuid())
  title       String
  projectId   String
  requestedBy String
  status      String   @default("Pending")
  dueDate     DateTime
}
```

---

## 🚀 Setup & Local Execution Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Step 1: Install Dependencies
From the repository root directory:
```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Step 2: Initialize SQLite Database & Seed Data
```bash
# Push Prisma schema to SQLite and run seed script
npm run db:setup
```

### Step 3: Run Development Servers
```bash
# Start backend API (port 5000) and frontend Vite server (port 5173) concurrently
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` inside both root and `server/` directories:
```env
PORT=5000
DATABASE_URL="file:./dev.db"

# Optional: Add Google Gemini API key for live LLM extraction.
# If omitted, ArchVoice automatically runs in Demo Fallback Mode!
GEMINI_API_KEY=""
```

---

## 🎬 3–5 Minute Hackathon Demo Script

Follow this sequence for the hackathon judging demo:

1. **Step 1: Open Dashboard**
   - Navigate to `http://localhost:5173`.
   - Point out **Project Alpha** (72% progress), pending tasks, 3 overdue tasks, and pending approvals.

2. **Step 2: Project Status Query**
   - Click **"Talk to Project"** or open **AI Assistant** tab.
   - Click the microphone icon 🎙 or type:
     > *"What is the current status of Project Alpha?"*
   - Show the visual **Project Summary Card** with metrics and progress bar.

3. **Step 3: Query Overdue Tasks**
   - Click mic or type:
     > *"Show me all overdue tasks."*
   - Point out real database records returned with overdue days and assigned team members (Rahul - Electrical layout, Priya - HVAC ceiling plan).

4. **Step 4: Team Responsibility Query**
   - Click mic or type:
     > *"Who is responsible for the electrical drawing?"*
   - Show the returned team member card for **Rahul Sharma** (Electrical Engineer).

5. **Step 5: Execute Action — Create Task**
   - Click mic or type:
     > *"Create a task for Rahul to finish the electrical drawing by Friday."*
   - Show the **Action Execution Confirmation Card** (`✓ Task created successfully`).
   - Switch to the **Tasks** or **Dashboard** view to prove the task was created in SQLite in real time!

6. **Step 6: Execute Action — Mark Task Completed**
   - Click mic or type:
     > *"Mark the HVAC drawing as completed."*
   - Show the task status update confirmation and updated database stats.

---

## 🔮 Future Improvements

- Multi-modal drawing ingestion (AI vision comparison of uploaded DWG/PDF blueprints).
- WhatsApp / Telegram bot integration for site engineers directly on construction sites.
- Automated BIM model IFC parsing for 3D clash detection alerts.

# 🎙️ ArchVoice — AI Conversational Project Assistant for AEC

<div align="center">

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ArchScale Guild Hackathon | Problem Statement AS-03: *"What if you could talk to your project?"***

*A voice-enabled, AI-driven project management cockpit tailored for Architecture, Engineering, and Construction (AEC) teams.*

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quickstart](#-quickstart--local-setup) • [Voice Commands](#-sample-voice-commands) • [Demo Script](#-hackathon-demo-script) • [API Reference](#-api-endpoints)

</div>

---

## 🏛️ Overview & Problem Statement

In large-scale AEC (Architecture, Engineering, and Construction) operations, critical project milestones and data are scattered across disconnected drawing revisions, civil sign-offs, email chains, and complex task boards. Site engineers and project managers spend hours hunting down:

- 📐 **Drawing & Model Statuses**: Electrical, HVAC, Structural, and Civil drawing approvals.
- ⏳ **Overdue Deliverables**: Critical-path bottlenecks and vendor delivery delays.
- 📝 **Pending Client Sign-Offs**: Municipal permits and consultant NOCs.
- 📁 **Document Vaults**: High-resolution DWG blueprints, BOQs, and BIM specs.

**ArchVoice transforms static project databases into a real-time conversational partner.** Using voice or natural language queries, project leaders can interrogate project health, identify critical bottlenecks, and directly trigger database operations without clicking through endless menus.

---

## ⚡ Key Features

- 🎙️ **Voice-First Interaction**: Web Speech API integration (`webkitSpeechRecognition` & `SpeechSynthesis`) with real-time waveform animations and audible voice responses.
- 🧠 **Dual-Engine AI Intent Parser**:
  - **Live Mode**: Powered by **Google Gemini AI** for semantic entity recognition and intent classification.
  - **Offline/Demo Mode**: Built-in deterministic fallback engine that guarantees 100% demo reliability without external API dependencies.
- ⚡ **Autonomous Database Actions**: Executes verified CRUD actions (e.g., creating tasks, updating drawing statuses, logging reminders) in real time with instant dashboard synchronization.
- 📊 **AEC Executive Dashboard**: High-level visual KPIs, project timeline trackers, Recharts velocity analytics, and live activity streams.
- 🏢 **Multi-Project Context Switching**: Seamlessly toggle between **Project Alpha** (Commercial Tower), **Project Horizon** (Eco Residences), and **Project Nova** (Metro Terminal), or query across all projects globally.
- 📑 **Comprehensive AEC Module Suite**:
  - 📋 **Interactive Kanban & Task Manager**
  - ✍️ **Formal Approval Workflow System**
  - 🗃️ **Document Vault with CAD/Drawing Metadata**
  - 👥 **Team Directory & Role Mapping**
  - 🔐 **Role-Based Authentication & Guest Mode**

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Frontend (React 18 + Vite + Tailwind CSS)"]
        User(["👷 Site Engineer / Project Manager"])
        Mic["🎙️ Web Speech API (Voice Input)"]
        ChatInput["💬 Text Chat Input"]
        UI["🖥️ Dashboard & Interactive UI Cards"]
        TTS["🔊 SpeechSynthesis (Voice Output)"]
        
        User -->|Speaks| Mic
        User -->|Types| ChatInput
        Mic --> UI
        ChatInput --> UI
        UI -->|Audible Playback| TTS
    end

    subgraph ServerLayer ["Backend (Node.js + Express REST API)"]
        APIRoute["📡 /api/ai/query Endpoint"]
        IntentEngine{"🧠 Intent Parsing Layer"}
        GeminiLLM["⚡ Google Gemini 1.5 Flash SDK"]
        FallbackRules["🛡️ Rule-Based Deterministic Fallback"]
        ActionExecutor["⚙️ Action & Query Executor"]

        APIRoute --> IntentEngine
        IntentEngine -->|API Key Present| GeminiLLM
        IntentEngine -->|No Key / Rate Limit| FallbackRules
        GeminiLLM -->|Structured JSON| ActionExecutor
        FallbackRules -->|Structured JSON| ActionExecutor
    end

    subgraph DataLayer ["Data Layer (Prisma ORM + PostgreSQL / SQLite)"]
        Prisma["💎 Prisma Client ORM"]
        Database[("🗄️ Project Database\n(Projects, Tasks, Approvals, Docs, Users)")]

        ActionExecutor <--> Prisma
        Prisma <--> Database
    end

    UI -->|POST /api/ai/query| APIRoute
    ActionExecutor -->|Rich Response + Widget Data| UI
```

---

## 🗂️ Repository Structure

```
ArchScale/
├── client/                     # Frontend React SPA
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI & Widget components
│   │   │   ├── Assistant/      # Voice modal, Chat Drawer, Waveforms
│   │   │   ├── Widgets/        # Visual Cards (Task, Approval, Metrics)
│   │   │   ├── Header.jsx      # Navigation, Project Selector, Quick Stats
│   │   │   └── Sidebar.jsx     # Navigation sidebar
│   │   ├── pages/              # Main dashboard and module views
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── ApprovalsPage.jsx
│   │   │   ├── DocumentsPage.jsx
│   │   │   ├── TeamPage.jsx
│   │   │   └── AuthPage.jsx
│   │   ├── App.jsx             # Main routing & global state
│   │   └── index.css           # Tailwind design tokens & animations
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API & AI Engine
│   ├── prisma/
│   │   └── schema.prisma       # Prisma ORM schema definition
│   ├── src/
│   │   ├── ai/
│   │   │   ├── gemini.js       # Google Gemini LLM integration
│   │   │   └── fallback.js     # Rule-based fallback parser
│   │   ├── db/
│   │   │   ├── client.js       # Prisma client instance
│   │   │   └── seed.js         # Realistic AEC seed dataset
│   │   ├── routes/
│   │   │   └── api.js          # REST endpoints & AI query orchestrator
│   │   └── index.js            # Express server initialization
│   ├── package.json
│   └── .env.example
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher

### Option 1: Automated 1-Step Setup (Recommended)

From the root directory:

```bash
# 1. Install all dependencies, run migrations, and seed AEC database
npm run setup

# 2. Launch both backend API (Port 5000) and frontend (Port 5173) concurrently
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

### Option 2: Manual Step-by-Step Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Manasamalli06/ArchVoice.git
cd ArchVoice
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

#### 3. Configure Environment Variables
Create a `.env` file in the root and `server/` directories (see `.env.example`):
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
# Optional: Add your Gemini API key. If omitted, demo mode activates automatically!
GEMINI_API_KEY="your_gemini_api_key_here"
```

#### 4. Prepare Database & Seed AEC Data
```bash
# Generate Prisma client and push schema
npm run db:push --prefix server

# Seed sample projects, drawing tasks, and team members
npm run db:seed --prefix server
```

#### 5. Start Development Servers
```bash
npm run dev
```

---

## 🗣️ Sample Voice Commands

You can speak or type any of these natural language prompts into ArchVoice:

| Goal / Action | Example Voice Command | What ArchVoice Does |
| :--- | :--- | :--- |
| 📊 **Project Health** | *"What is the current status of Project Alpha?"* | Displays progress bar, milestone metrics, completion dates, and budget summary |
| ⚠️ **Risk Identification** | *"Show me all overdue tasks across all sites."* | Fetches overdue drawings, elapsed days, and assigned contractors |
| ✍️ **Permits & Approvals** | *"Are there any pending approvals for Horizon?"* | Lists pending client NOCs, environmental clearances, and structural sign-offs |
| 👤 **Team Lookup** | *"Who is in charge of the electrical drawing?"* | Identifies responsible engineer, contact information, and active tasks |
| ➕ **Create Work Item** | *"Create a task for Rahul to update the structural drawing by Friday."* | Automatically adds task to DB, assigns engineer, and renders confirmation card |
| ✅ **Status Update** | *"Mark the HVAC ceiling layout as completed."* | Updates database status to 'Completed' and adjusts project completion velocity |
| 🔔 **Reminders** | *"Set a reminder for Priya regarding the client review tomorrow."* | Logs notification in the activity stream |

---

## 🎬 Hackathon Demo Script

Follow this 3-minute sequence for evaluating the application:

1. **Step 1: Dashboard Overview**
   - Open `http://localhost:5173`.
   - Highlight the **Live AEC Project Metrics**, 72% overall completion, overdue task indicators, and urgent drawing approvals.
2. **Step 2: Voice Query — Project Status**
   - Click the **"Talk to Project"** button in the header or floating assistant.
   - Say or type: `What is the status of Project Alpha?`
   - Observe the conversational readout and the interactive **Project Summary Widget**.
3. **Step 3: Voice Query — Overdue Drawing Deliverables**
   - Say or type: `Show me all overdue tasks.`
   - Point out real database records showing overdue days, urgency badges, and assignees.
4. **Step 4: Voice Action — Create Task**
   - Say or type: `Create a task for Rahul to finish the electrical layout by Friday.`
   - Notice the instant action confirmation widget (`✓ Task created successfully`).
   - Navigate to the **Tasks** tab to verify that the task was written to the database in real time.
5. **Step 5: Voice Action — Close Task**
   - Say or type: `Mark the HVAC drawing as completed.`
   - Verify that the task status updates immediately in the UI.

---

## 📡 API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/query` | Main AI conversational orchestrator (processes NLP query & executes actions) |
| `GET` | `/api/projects` | Retrieve all projects with progress, task, and approval counts |
| `GET` | `/api/projects/:id` | Retrieve single project details including associated documents and activities |
| `GET` | `/api/tasks` | Get all tasks (supports filtering by `projectId`, `status`, `priority`) |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/:id` | Update task status or details |
| `GET` | `/api/approvals` | Fetch all pending and approved sign-offs |
| `POST` | `/api/approvals/:id/approve` | Approve a pending AEC sign-off request |
| `GET` | `/api/documents` | List all blueprints, CAD files, and technical specifications |
| `GET` | `/api/team` | Fetch team members, specializations, and assigned deliverables |
| `GET` | `/api/stats` | High-level executive statistics and aggregate completion data |

---

## 🔮 Roadmap

- [ ] **BIM & CAD Viewer Integration**: In-browser 3D IFC/DWG viewer with voice-controlled layer toggling.
- [ ] **Multi-Modal Blueprint Ingestion**: Upload blueprint images/PDFs for AI visual delta & revision analysis.
- [ ] **Site Messenger Bot**: WhatsApp & Telegram webhook integrations for on-site foreman updates.
- [ ] **Offline Edge Sync**: PWA support with localized SQLite sync for remote construction sites without internet.

---

## 👥 Contributors & Acknowledgements

Developed with ❤️ for the **ArchScale Guild Hackathon (Problem Statement AS-03)**.

- **Developer**: [Manasa](https://github.com/Manasamalli06)
- **Built with**: Google Gemini AI, React, Vite, Node.js, Express, Prisma, Tailwind CSS.

---

<div align="center">
  <sub>Built for the future of voice-first Architecture, Engineering & Construction technology.</sub>
</div>

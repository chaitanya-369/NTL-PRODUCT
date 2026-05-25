# NTL Hackathon Intelligence Agent
## Main Product — Full Technical Architecture & Build Plan
### The Real Firebase Product

---

> **Mission:** Build the autonomous operating system for Next Tech Lab. A living, breathing machine that tracks every opportunity on earth, matches the right people to the right competition, dispatches them across every channel they use, locks their focus, archives their wins, and makes the entire club measurably more dominant — with zero manual board lead intervention.

---

## TABLE OF CONTENTS

1. [Product Vision & Scope](#1-product-vision--scope)
2. [User Roles & Access Architecture](#2-user-roles--access-architecture)
3. [Full Tech Stack](#3-full-tech-stack)
4. [Firestore Database Schema (Complete)](#4-firestore-database-schema-complete)
5. [The Nine-Agent Pipeline Architecture](#5-the-nine-agent-pipeline-architecture)
6. [Notification System Architecture](#6-notification-system-architecture)
7. [Calendar Lock System](#7-calendar-lock-system)
8. [The Vault Agent System](#8-the-vault-agent-system)
9. [Analytics & Leaderboard Engine](#9-analytics--leaderboard-engine)
10. [Frontend Architecture (Full App)](#10-frontend-architecture-full-app)
11. [UI Component System](#11-ui-component-system)
12. [V1 vs V2 Feature Split](#12-v1-vs-v2-feature-split)
13. [Build Phases, Batches, Tasks & Subtasks](#13-build-phases-batches-tasks--subtasks)
14. [File & Folder Structure](#14-file--folder-structure)
15. [Security & Performance Architecture](#15-security--performance-architecture)
16. [Scaling Roadmap (NTL → India)](#16-scaling-roadmap-ntl--india)
17. [The Maintainer Playbook](#17-the-maintainer-playbook)

---

## 1. PRODUCT VISION & SCOPE

### What This Product Is

The **NTL Hackathon Intelligence Agent** is a full-stack, multi-tenant, role-aware SaaS operating system built exclusively for Next Tech Lab at SRM Kattankulathur. It is not a tool. It is not a dashboard. It is an autonomous decision-making machine that:

- **Hunts** every opportunity on the global tech circuit 24/7
- **Analyzes** them deeper than any human researcher could in the same time
- **Matches** the exact right combination of NTL members to each one
- **Dispatches** them across every communication channel simultaneously
- **Locks** committed teams into laser focus and silences distractions
- **Archives** every win into a searchable institutional knowledge base
- **Measures** every outcome and surfaces patterns that make NTL smarter over time

### The Four Problems It Eliminates Simultaneously

| Problem | How the System Kills It |
|---|---|
| Missing global opportunities | 24/7 scout agents watch every source — RSS, APIs, Reddit, Telegram, newsletters |
| Wrong people at wrong hackathons | AI cross-matches full skill profiles against every requirement before a human sees it |
| Member distraction and context switching | FSM calendar lock + notification blackout for locked members |
| Institutional knowledge loss when seniors graduate | Vault Agent auto-archives every winning codebase with AI-extracted patterns |

### Who Uses It (All 50–100 Members)

| Role | What They See and Do |
|---|---|
| `super_admin` (Chaitanya) | Full system access, agent config, cost telemetry, all data |
| `board_lead` | War Room dashboard, squad approval, member management, all analytics |
| `lab_lead` | Their lab's members, lab-specific opportunities, squad approval for their lab |
| `lab_member` | Personal dashboard, their opportunities, their calendar, their stats |
| `recruit` | Limited view — onboarding flow only until approved by board lead |

### V1 Launch Scope (What Gets Built First)
The V1 must be tight, stable, and impressive. Every feature listed below must work perfectly before any V2 feature gets touched.

**V1 Core:**
- Full auth system with domain restriction + role assignment
- Complete member profile pipeline (GitHub + LinkedIn + resume)
- Scout Agent (MLH, Devpost, Unstop, HackerEarth — 4 sources)
- Analyzer Agent (Gemini tagging + value scoring)
- Basic Matchmaker Agent (single squad per opportunity)
- Discord + Email notification dispatch
- Basic Calendar Lock (Google Calendar sync)
- Board Lead War Room dashboard
- Member personal dashboard
- Basic post-hackathon result logging

**V2 (After NTL Validates V1):**
- All 5 notification channels (WhatsApp, Telegram, Slack added)
- Deep Research parallel agents (4 agents per high-value opportunity)
- Multiple squad drafting per opportunity
- Full Vault Agent pipeline
- Mock Judge Pitch Simulator
- Tesla Lab Hardware Inventory Manager
- Emergency Sub Protocol
- Full analytics engine + public leaderboard
- Token Telemetry dashboard
- Boilerplate Generator

---

## 2. USER ROLES & ACCESS ARCHITECTURE

### Role Hierarchy

```
super_admin
    └── board_lead
            └── lab_lead
                    └── lab_member
                            └── recruit
```

### Role Permissions Matrix

| Feature | super_admin | board_lead | lab_lead | lab_member | recruit |
|---|---|---|---|---|---|
| View all opportunities | ✅ | ✅ | ✅ | ✅ (filtered) | ❌ |
| Approve/reject squad drafts | ✅ | ✅ | ✅ (own lab) | ❌ | ❌ |
| Edit member profiles | ✅ | ✅ | ✅ (own lab) | ✅ (own) | ✅ (own) |
| Trigger emergency sub | ✅ | ✅ | ✅ (own lab) | ❌ | ❌ |
| View war room | ✅ | ✅ | ✅ (own lab) | ❌ | ❌ |
| View own dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configure agents | ✅ | ❌ | ❌ | ❌ | ❌ |
| View token telemetry | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage hardware inventory | ✅ | ✅ | ✅ (Tesla) | ❌ | ❌ |
| Access Vault | ✅ | ✅ | ✅ | ✅ | ❌ |
| Invite new members | ✅ | ✅ | ✅ (own lab) | ❌ | ❌ |
| Configure notification preferences | ✅ | ✅ | ✅ | ✅ | ❌ |

### Member FSM Status

```
RECRUIT ──[board_lead approves]──► ACTIVE
                                      │
                           ┌──────────┼──────────┐
                           ▼          ▼          ▼
                       AVAILABLE  REVIEWING   LOCKED
                           │                     │
                           └──[hackathon ends]───┘
                                      │
                                      ▼
                                  AVAILABLE
```

### Firestore Security Rules Architecture

```javascript
// High-level rules structure

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isLabLead() || isBoardLead();
      allow write: if request.auth.uid == userId || isSuperAdmin();
    }

    // Opportunities: all active members can read
    match /opportunities/{oppId} {
      allow read: if isActiveMember();
      allow write: if isSuperAdmin(); // Only agents write this
    }

    // Squad recommendations: board + lab leads only
    match /squad_recommendations/{squadId} {
      allow read: if isLabLead() || isBoardLead();
      allow write: if isSuperAdmin();
    }

    // Analytics: readable by all active members
    match /analytics/{docId} {
      allow read: if isActiveMember();
      allow write: if isSuperAdmin();
    }
  }
}
```

---

## 3. FULL TECH STACK

### Frontend
```
Next.js 15 (App Router)
  └── React 19
  └── TypeScript (strict mode)
  └── Turbopack (dev server)
  └── Tailwind CSS v4
  └── shadcn/ui
  └── Framer Motion v11
  └── Lucide React (icons)
  └── Recharts (analytics graphs)
  └── clsx + tailwind-merge
```

### Backend & Infrastructure
```
Firebase (Google Cloud)
  ├── Firebase Authentication
  │     └── Google Sign-In (domain restricted: @srmist.edu.in)
  │     └── Custom Claims (role injection on sign-in)
  ├── Cloud Firestore (NoSQL database)
  │     └── Multi-collection relational data
  │     └── Compound indexes for agent queries
  │     └── Real-time listeners for live UI
  ├── Cloud Functions v2
  │     ├── onSchedule (cron jobs — Scout Agent)
  │     ├── onDocumentCreated (Firestore triggers — Analyzer)
  │     ├── onCall (client-invoked functions — approvals)
  │     └── onRequest (webhook receivers — Discord confirmations)
  ├── Firebase Storage
  │     └── Resume uploads (PDF)
  │     └── Pitch deck uploads (PDF)
  │     └── Opportunity rulebook storage
  └── Firebase App Hosting
        └── Next.js 15 native deployment
        └── Edge CDN, automatic HTTPS
```

### AI Engine
```
Firebase Genkit
  └── Gemini 1.5 Pro (long-context PDF parsing, deep analysis)
  └── Gemini 2.0 Flash (fast tagging, classification, scoring)
  └── Gemini 1.5 Pro Vision (pitch deck analysis — V2)
  └── Structured output schemas (enforced JSON)
  └── Flow orchestration (multi-step agent pipelines)
```

### Background Processing
```
Google Cloud Tasks
  └── Parallel deep research agent queuing
  └── Retry logic for failed agent runs
  └── Rate limiting for API-heavy operations
```

### Third-Party Integrations
```
Notifications:
  ├── Discord — Native Webhook API
  ├── Slack — Slack Bolt SDK / Incoming Webhooks
  ├── Email — Resend API (better deliverability than SendGrid in 2026)
  ├── Telegram — Telegram Bot API (node-telegram-bot-api)
  └── WhatsApp — Twilio WhatsApp Business API

Calendar:
  └── Google Calendar API (via Google Workspace)
  └── googleapis npm package

GitHub:
  └── Octokit (GitHub REST API)
  └── Public repo scanning for skill detection
  └── Post-hackathon repo pulling for Vault Agent

LinkedIn:
  └── LinkedIn API v2 (profile data for skill enrichment)
  └── Puppeteer fallback for public profile scraping (if API limits hit)

Search (Vault):
  └── Algolia (instant full-text search over knowledge base)
  └── Firebase Extension: Algolia Search sync

Scraping Sources:
  ├── MLH API
  ├── Devpost API
  ├── Unstop API
  ├── HackerEarth API
  ├── RSS feeds (university portals, tech newsletters)
  ├── Reddit API (r/hackathon, r/cscareerquestions)
  ├── Telegram channel monitoring (Bot API)
  └── Twitter/X API v2 (hackathon announcements)
```

### Dev Tools
```
ESLint + Prettier
Husky (pre-commit hooks)
TypeScript strict config
Vitest (unit tests for agent logic)
Playwright (E2E tests for critical flows)
GitHub Actions (CI/CD pipeline)
```

---

## 4. FIRESTORE DATABASE SCHEMA (COMPLETE)

### Collection: `users`
```typescript
interface UserDocument {
  uid: string                          // Firebase Auth UID
  email: string                        // @srmist.edu.in or @nexttechlab.in
  displayName: string
  photoURL: string
  role: 'super_admin' | 'board_lead' | 'lab_lead' | 'lab_member' | 'recruit'
  labAffiliation: 'McCarthy' | 'Norman' | 'Tesla' | 'Satoshi' | 'None'
  status: 'RECRUIT' | 'AVAILABLE' | 'REVIEWING' | 'LOCKED'
  
  // Auto-built skill profile
  skillProfile: {
    skills: string[]                   // e.g., ["Next.js", "Firebase", "Python"]
    skillScores: Record<string, number> // e.g., { "Next.js": 92, "Python": 78 }
    primaryRole: string                // e.g., "Full-Stack Architect"
    githubUrl: string
    linkedinUrl: string
    resumeStorageRef: string           // Firebase Storage path
    lastProfileSync: Timestamp
  }
  
  // Hackathon history
  hackathonHistory: {
    totalParticipations: number
    wins: number
    winRate: number                    // 0–100
    totalPrizeMoney: number
    contributionScore: number          // AI-calculated across all events
  }
  
  // Notification preferences
  notificationPreferences: {
    discord: boolean
    slack: boolean
    email: boolean
    telegram: boolean
    whatsapp: boolean
    discordHandle: string
    slackId: string
    telegramChatId: string
    whatsappNumber: string
  }
  
  // Current lock info (if LOCKED)
  currentLock: {
    squadId: string | null
    opportunityId: string | null
    lockedUntil: Timestamp | null
  }
  
  createdAt: Timestamp
  updatedAt: Timestamp
  approvedBy: string | null            // board_lead uid who approved this member
}
```

### Collection: `opportunities`
```typescript
interface OpportunityDocument {
  id: string
  
  // Core info
  title: string
  organizer: string
  url: string
  sourceAPI: string                    // 'mlh' | 'devpost' | 'unstop' | 'reddit' | etc.
  opportunityType:                     // What kind of opportunity
    | 'hackathon'
    | 'tech_fest'
    | 'competition'
    | 'collaboration'
    | 'sponsorship'
    | 'internship'
    | 'conference'
  
  // Dates
  announcedAt: Timestamp
  registrationDeadline: Timestamp
  startDate: Timestamp
  endDate: Timestamp
  
  // AI-extracted constraints
  constraints: {
    maxTeamSize: number
    minTeamSize: number
    isOnline: boolean
    location: string | null
    eligibility: string[]              // e.g., ["undergraduate", "India only"]
    techTracks: string[]               // e.g., ["AI/ML", "Web3", "IoT"]
    requiredSkills: string[]           // Extracted by Analyzer Agent
    hardwareRequired: boolean
    hardwareList: string[]
  }
  
  // AI scoring
  aiScoring: {
    valueScore: number                 // 0–100 (prize + prestige + relevance)
    prizeMoney: number
    prestigeScore: number              // 0–100 (based on organizer reputation)
    relevanceScore: number             // 0–100 (match to NTL's current skills)
    notificationTier:
      | 'instant'                      // Score 80+: notify immediately
      | 'batched'                      // Score 50–79: include in daily digest
      | 'archived'                     // Score <50: stored but not notified
  }
  
  // Deep research (populated by Research Agents — V2)
  tacticalBrief: {
    pastWinnersAnalysis: string | null
    judgeProfiles: string[] | null
    hiddenBounties: string[] | null
    ruleSummary: string | null
    recommendedStack: string[] | null
    briefGeneratedAt: Timestamp | null
  }
  
  // Status tracking
  status:
    | 'staged'                         // Raw, not yet analyzed
    | 'analyzed'                       // Gemini tagged, scored
    | 'squad_drafted'                  // Matchmaker created recommendation
    | 'dispatched'                     // Board lead approved, notifications sent
    | 'locked'                         // Team committed
    | 'completed'                      // Hackathon ended
    | 'archived'                       // In vault
  
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Invite-Only'
  geographicScope: 'local' | 'national' | 'global'
  
  createdAt: Timestamp
  analyzedAt: Timestamp | null
}
```

### Collection: `raw_opportunities`
```typescript
// Staging collection — Scout Agent writes here, Analyzer reads and deletes
interface RawOpportunityDocument {
  rawText: string                      // Raw HTML or JSON from source
  sourceUrl: string
  sourceAPI: string
  scrapedAt: Timestamp
  processingStatus: 'pending' | 'processing' | 'done' | 'failed'
}
```

### Collection: `squad_recommendations`
```typescript
interface SquadRecommendationDocument {
  id: string
  opportunityId: string               // Reference to opportunities
  
  // Draft squads (can be multiple if AI decides)
  squads: Array<{
    squadIndex: number                 // Squad A, Squad B, etc.
    memberIds: string[]                // Array of user UIDs
    memberRoles: Record<string, string> // uid → role e.g., "Next.js Lead"
    memberScores: Record<string, number> // uid → fit score
    overallMatchScore: number          // 0–100
    aiRationale: string               // Gemini-generated explanation
    hardwareReservations: string[]     // Auto-reserved hardware items
  }>
  
  // Approval workflow
  approvalStatus: 'pending' | 'approved' | 'modified' | 'rejected'
  approvedBy: string | null           // board_lead uid
  approvalNote: string | null         // Board lead comment
  modifiedSquad: string[] | null      // If board lead changed the squad
  
  createdAt: Timestamp
  approvedAt: Timestamp | null
}
```

### Collection: `squads`
```typescript
// Confirmed squads (created from approved squad_recommendations)
interface SquadDocument {
  id: string
  opportunityId: string
  recommendationId: string
  
  members: Array<{
    uid: string
    name: string
    role: string
    labAffiliation: string
  }>
  
  status: 'active' | 'competing' | 'completed' | 'withdrawn'
  
  // Result (filled after competition)
  result: {
    placement: string | null           // e.g., "1st", "Top 10", "Finalist"
    prizeWon: number | null
    repoUrl: string | null
    devpostUrl: string | null
    pitchDeckStorageRef: string | null
    teamRating: number | null          // Board lead rates 1–5
    notes: string | null
  }
  
  // Calendar
  calendarEventIds: string[]          // Google Calendar event IDs per member
  
  lockedAt: Timestamp
  completedAt: Timestamp | null
}
```

### Collection: `notifications`
```typescript
interface NotificationDocument {
  id: string
  opportunityId: string
  squadRecommendationId: string | null
  
  // Targeting
  recipientIds: string[]              // User UIDs targeted
  recipientRoles: string[]            // Which roles were targeted
  
  // Content
  notificationTier: 'instant' | 'batched'
  messageType:
    | 'opportunity_alert'
    | 'squad_draft'
    | 'squad_approved'
    | 'calendar_locked'
    | 'emergency_sub'
    | 'hackathon_reminder'
    | 'vault_archived'
  
  // Delivery status per channel
  deliveryStatus: {
    discord: 'pending' | 'sent' | 'failed' | 'skipped'
    slack: 'pending' | 'sent' | 'failed' | 'skipped'
    email: 'pending' | 'sent' | 'failed' | 'skipped'
    telegram: 'pending' | 'sent' | 'failed' | 'skipped'
    whatsapp: 'pending' | 'sent' | 'failed' | 'skipped'
  }
  
  sentAt: Timestamp
  deliveredAt: Timestamp | null
}
```

### Collection: `knowledge_vault`
```typescript
interface VaultDocument {
  id: string
  squadId: string
  opportunityId: string
  
  // Source
  repoUrl: string
  primaryLanguages: string[]
  techStack: string[]
  
  // AI Analysis (Vault Agent)
  analysis: {
    summary: string                    // What this project does
    architecturePattern: string        // e.g., "Monorepo + Firebase + Next.js"
    keyBoilerplates: Array<{
      name: string                     // e.g., "Firebase Auth + Next.js 15"
      description: string
      codeSnippetRef: string           // Storage path to extracted snippet
    }>
    winningFactors: string[]           // Why this won
    reusabilityScore: number           // 0–100
    tags: string[]                     // For search
  }
  
  // Search
  searchableText: string              // Algolia syncs this field
  
  // Metadata
  hackathonTitle: string
  placement: string
  prizeWon: number
  archivedAt: Timestamp
  archivedBy: string                  // 'vault_agent' or uid
}
```

### Collection: `hardware_inventory`
```typescript
interface HardwareItemDocument {
  id: string
  name: string                        // e.g., "ESP32 DevKit v4"
  category: 'microcontroller' | 'sensor' | 'display' | 'vr' | 'camera' | 'other'
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
  
  reservations: Array<{
    squadId: string
    opportunityTitle: string
    quantity: number
    reservedAt: Timestamp
    returnExpectedAt: Timestamp
    returned: boolean
  }>
  
  location: string                    // Physical location in Tesla Lab
  qrCode: string                      // QR code for physical scan
}
```

### Collection: `analytics`
```typescript
// Per-member performance record
interface MemberAnalyticsDocument {
  uid: string
  
  // Career stats
  totalOpportunities: number          // Opportunities they were drafted for
  totalParticipations: number         // Opportunities they actually competed in
  wins: number
  placements: Record<string, number>  // { "1st": 2, "Top 5": 3, "Finalist": 1 }
  totalPrizeMoney: number
  winRate: number                     // percentage
  
  // Skill growth (tracked over time)
  skillGrowth: Array<{
    skill: string
    scoreHistory: Array<{ date: Timestamp; score: number }>
  }>
  
  // Contribution
  contributionScore: number           // Composite score — AI calculated
  leaderboardRank: number
  
  // Per-hackathon breakdown
  eventHistory: Array<{
    opportunityId: string
    opportunityTitle: string
    role: string
    placement: string | null
    contribution: number              // 0–100, AI-estimated
    date: Timestamp
  }>
  
  lastUpdated: Timestamp
}
```

### Collection: `system_config`
```typescript
// Single document — read by all agents on startup
interface SystemConfigDocument {
  id: 'global'
  
  // Agent settings
  scoutCronInterval: number           // Hours between scout runs (default: 6)
  activeScoutSources: string[]        // Which sources are enabled
  valueScoreThreshold: {
    instant: number                   // Min score for instant notification (default: 80)
    batched: number                   // Min score for batched notification (default: 50)
  }
  
  // Gemini settings
  analyzerModel: string               // 'gemini-1.5-pro' | 'gemini-2.0-flash'
  matchmakerConfidenceThreshold: number // Min score to include member in squad (default: 75)
  
  // Lab configuration
  labs: Array<{
    name: string
    discordChannelWebhook: string
    slackChannelId: string
    labLeadUid: string
  }>
  
  // Maintenance
  maintenanceMode: boolean
  lastAgentRun: Timestamp
  totalOpportunitiesIndexed: number
  totalSquadsDeployed: number
  
  updatedAt: Timestamp
}
```

### Collection: `activity_feed`
```typescript
// Real-time activity log — powers the War Room live feed
interface ActivityFeedDocument {
  id: string
  type:
    | 'opportunity_found'
    | 'squad_drafted'
    | 'squad_approved'
    | 'squad_dispatched'
    | 'member_locked'
    | 'member_unlocked'
    | 'vault_archived'
    | 'emergency_sub_triggered'
    | 'member_joined'
    | 'hardware_reserved'
  
  title: string                       // Short human-readable description
  body: string | null                 // Optional detail
  actorId: string | null             // Who triggered it (uid or 'system')
  relatedEntityId: string | null     // Opportunity, squad, or user ID
  
  createdAt: Timestamp
}
```

---

## 5. THE NINE-AGENT PIPELINE ARCHITECTURE

### Agent Overview Map

```
EXTERNAL WORLD
     │
     ▼
[Agent 1: Scout]          ←── onSchedule every 6h
     │ raw_opportunities
     ▼
[Agent 2: Deduplicator]   ←── onDocumentCreated (raw_opportunities)
     │ unique raw docs
     ▼
[Agent 3: Analyzer]       ←── onDocumentCreated (deduped raw)
     │ structured opportunities
     ▼
[Agent 4: Value Filter]   ←── onDocumentCreated (opportunities)
     │ high-value opportunities → Cloud Tasks queue
     ▼
[Agent 5: Research Cluster] ←── Cloud Tasks (parallel, 4 sub-agents)
     │ tactical brief
     ▼
[Agent 6: Matchmaker]     ←── onDocumentUpdated (tactical brief ready)
     │ squad_recommendations
     ▼
[HUMAN: Board Lead Approves]
     │ approved recommendation
     ▼
[Agent 7: Dispatcher]     ←── onDocumentUpdated (approval status change)
     │ notifications sent
     ▼
[HUMAN: Team Lead Commits]
     │ commit trigger (onCall function)
     ▼
[Agent 8: Calendar Locker] ←── onCall (commit trigger)
     │ calendar locked, FSM updated
     ▼
[COMPETITION ENDS]
     │ end date passed
     ▼
[Agent 9: Vault Archiver] ←── onSchedule (daily check for completed squads)
```

---

### Agent 1: Scout Agent
**Trigger:** `onSchedule` — every 6 hours
**Runtime:** Cloud Functions v2 Node.js
**Goal:** Pull every new opportunity from every source and dump raw data to staging

```typescript
// Cloud Function: scoutAgent

const SOURCES = [
  // Tier 1: Official APIs
  { name: 'mlh', handler: scrapeMlh, weight: 1.0 },
  { name: 'devpost', handler: scrapeDevpost, weight: 1.0 },
  { name: 'unstop', handler: scrapeUnstop, weight: 0.9 },
  { name: 'hackerearth', handler: scrapeHackerEarth, weight: 0.9 },
  
  // Tier 2: RSS Feeds
  { name: 'rss_techcrunch', handler: scrapeRSS('https://techcrunch.com/feed/'), weight: 0.7 },
  { name: 'rss_yc', handler: scrapeRSS('https://news.ycombinator.com/rss'), weight: 0.8 },
  
  // Tier 3: Social Signals
  { name: 'reddit_hackathon', handler: scrapeReddit('r/hackathon'), weight: 0.6 },
  { name: 'twitter_hackathon', handler: scrapeTwitter('#hackathon OR #buildathon'), weight: 0.5 },
  { name: 'telegram_channels', handler: scrapeTelegramChannels(), weight: 0.7 },
]

// Each handler:
// 1. Fetches data from source
// 2. Checks against existing opportunity URLs (dedup pre-check)
// 3. Writes new raw documents to raw_opportunities collection
// 4. Updates system_config.lastAgentRun + totalOpportunitiesIndexed
```

**Error Handling:**
- Each source runs independently — one failing source doesn't kill the entire scout run
- Failed sources are logged to a `scout_errors` subcollection
- Retry via Cloud Tasks if a source returns 429 (rate limited)

---

### Agent 2: Deduplicator Agent
**Trigger:** `onDocumentCreated` on `raw_opportunities`
**Goal:** Prevent the same opportunity appearing twice from different sources

```typescript
// Dedup logic:
// 1. Extract the canonical URL from raw document
// 2. Query opportunities collection for existing URL match
// 3. Query raw_opportunities for URL match (currently being processed)
// 4. If unique → mark raw doc as 'ready_for_analysis'
// 5. If duplicate → delete raw doc and log to dedup_log
// 6. Uses SHA256 hash of URL as dedup key stored in a flat dedup_index collection
```

---

### Agent 3: Analyzer Agent
**Trigger:** `onDocumentUpdated` on `raw_opportunities` (status → 'ready_for_analysis')
**Powered by:** Gemini 2.0 Flash (fast, cheap) for standard tagging
**Powered by:** Gemini 1.5 Pro for long rulebook PDFs
**Goal:** Transform raw text into clean structured opportunity data

```typescript
// Genkit Flow: analyzeOpportunity

const analyzerFlow = defineFlow(
  { name: 'analyzeOpportunity', inputSchema: z.string(), outputSchema: OpportunitySchema },
  async (rawText) => {
    const result = await generate({
      model: gemini20Flash,
      prompt: `
        Analyze this hackathon/tech event announcement.
        Extract ALL of the following into strict JSON.
        If information is missing, use null — never hallucinate.
        
        Extract:
        - title, organizer, url
        - opportunityType (hackathon/tech_fest/competition/collaboration/sponsorship/internship)
        - registrationDeadline, startDate, endDate (ISO 8601)
        - maxTeamSize, minTeamSize
        - isOnline (boolean)
        - location (city, country or null)
        - eligibility constraints (array of strings)
        - techTracks (array: AI/ML, Web3, IoT, AR/VR, Cybersecurity, etc.)
        - requiredSkills (specific technologies mentioned)
        - hardwareRequired (boolean)
        - hardwareList (array or empty)
        - prizeMoney (number in USD, 0 if none)
        - difficulty (Beginner/Intermediate/Advanced/Invite-Only)
        - geographicScope (local/national/global)
        
        Raw text:
        ${rawText}
      `,
      output: { schema: OpportunitySchema }
    })
    return result.output
  }
)
```

**After Analysis:**
- Write structured data to `opportunities` collection
- Delete raw document from staging
- Log to `activity_feed`: "opportunity_found"

---

### Agent 4: Value Filter Agent
**Trigger:** `onDocumentCreated` on `opportunities`
**Goal:** Score the opportunity and decide notification tier

```typescript
// Scoring algorithm

function calculateValueScore(opportunity: OpportunityDocument): number {
  let score = 0
  
  // Prize money (max 30 points)
  if (opportunity.aiScoring.prizeMoney >= 50000) score += 30
  else if (opportunity.aiScoring.prizeMoney >= 10000) score += 20
  else if (opportunity.aiScoring.prizeMoney >= 1000) score += 10
  
  // Prestige (max 30 points)
  const prestigeOrganizers = ['MIT', 'ETHGlobal', 'MLH', 'Google', 'Microsoft', 'YCombinator']
  if (prestigeOrganizers.some(o => opportunity.organizer.includes(o))) score += 30
  else if (opportunity.difficulty === 'Invite-Only') score += 20
  else score += 10
  
  // Relevance to NTL skill matrix (max 25 points)
  const ntlCoreSkills = ['Next.js', 'Firebase', 'AI/ML', 'Web3', 'IoT', 'React']
  const matchCount = opportunity.constraints.techTracks
    .filter(t => ntlCoreSkills.some(s => t.includes(s))).length
  score += Math.min(matchCount * 8, 25)
  
  // Timeline viability (max 15 points)
  const daysUntilDeadline = daysBetween(new Date(), opportunity.registrationDeadline.toDate())
  if (daysUntilDeadline >= 14) score += 15
  else if (daysUntilDeadline >= 7) score += 8
  else score += 2
  
  return Math.min(score, 100)
}

// Notification tier assignment:
// score >= 80 → 'instant' (trigger Agent 5 + 6 immediately)
// score 50–79 → 'batched' (add to daily digest, trigger Agent 6 later)
// score < 50  → 'archived' (stored, no notification)
```

---

### Agent 5: Research Cluster (Parallel Deep Agents)
**Trigger:** Cloud Tasks queue (enqueued by Value Filter for instant-tier opportunities)
**Architecture:** 4 independent Cloud Tasks running in parallel
**Powered by:** Gemini 1.5 Pro (long-context)
**Goal:** Build a complete "Tactical Brief" before the squad is drafted
**Note: This is V2 — not in V1 scope**

```
Research Task Queue
├── Task A: GitHub Historical Winner Analysis
│   └── Search GitHub for repos from past years of this hackathon
│   └── Gemini analyzes top 3 repos: stack, architecture, what made them win
│   └── Outputs: recommendedStack, boilerplateRef
│
├── Task B: Rulebook & Sponsor Deep Parse
│   └── Download PDF from opportunity URL
│   └── Gemini 1.5 Pro reads full document (long-context)
│   └── Extracts: hidden bounties, sponsor-specific tracks, judging rubric weights
│   └── Outputs: hiddenBounties[], judgingCriteria{}
│
├── Task C: Judge Profile Intelligence
│   └── Finds judge names from hackathon website
│   └── Pulls their LinkedIn / Twitter (public)
│   └── Gemini synthesizes: what they value, what they've funded before
│   └── Outputs: judgeProfiles[], biasWeights{}
│
└── Task D: Past Winner Pattern Analysis
    └── Devpost search for this hackathon's past years
    └── Scrapes winning project descriptions
    └── Gemini finds patterns: common tech, team compositions
    └── Outputs: winningPatterns[], teamCompositionTrends{}
```

**Merge Step:**
- All 4 tasks write to `opportunities/{id}/research_fragments/{taskId}`
- A merge Cloud Function (triggered when all 4 complete) compiles them into `tacticalBrief`
- Updates opportunity status to trigger Agent 6

---

### Agent 6: Matchmaker Agent
**Trigger:** `onDocumentUpdated` on `opportunities` (status → 'analyzed' or 'research_complete')
**Powered by:** Gemini 2.0 Flash for scoring + standard Firestore query
**Goal:** Draft the optimal squad(s) and write to `squad_recommendations`

```typescript
// Matchmaker Algorithm

async function matchmaker(opportunity: OpportunityDocument) {
  
  // Step 1: Query ONLY available members
  const availableMembers = await db
    .collection('users')
    .where('status', '==', 'AVAILABLE')
    .get()
  
  // Step 2: Score each member against opportunity requirements
  const scoredMembers = availableMembers.docs.map(doc => {
    const member = doc.data() as UserDocument
    const score = calculateMemberFitScore(member, opportunity)
    return { ...member, fitScore: score }
  })
  
  // Step 3: Sort by fit score descending
  const ranked = scoredMembers
    .filter(m => m.fitScore >= CONFIG.matchmakerConfidenceThreshold)
    .sort((a, b) => b.fitScore - a.fitScore)
  
  // Step 4: Draft squads
  // For team size N, draft the top N members
  // If enough members exist for multiple squads, draft Squad B, C...
  const maxTeamSize = opportunity.constraints.maxTeamSize
  const squads = []
  
  for (let i = 0; i < ranked.length; i += maxTeamSize) {
    const squadMembers = ranked.slice(i, i + maxTeamSize)
    if (squadMembers.length < opportunity.constraints.minTeamSize) break
    
    // Step 5: Generate AI rationale for this squad
    const rationale = await generateRationale(squadMembers, opportunity)
    
    // Step 6: Auto-reserve hardware if needed
    const hardwareReservations = opportunity.constraints.hardwareRequired
      ? await reserveHardware(opportunity.constraints.hardwareList, `squad_${i}`)
      : []
    
    squads.push({
      squadIndex: i / maxTeamSize,
      memberIds: squadMembers.map(m => m.uid),
      memberRoles: assignRoles(squadMembers, opportunity),
      memberScores: Object.fromEntries(squadMembers.map(m => [m.uid, m.fitScore])),
      overallMatchScore: average(squadMembers.map(m => m.fitScore)),
      aiRationale: rationale,
      hardwareReservations
    })
  }
  
  // Step 7: Write to squad_recommendations
  await db.collection('squad_recommendations').add({
    opportunityId: opportunity.id,
    squads,
    approvalStatus: 'pending',
    createdAt: Timestamp.now()
  })
  
  // Step 8: Log to activity_feed
  await logActivity('squad_drafted', ...)
}
```

**Member Fit Score Calculation:**
```typescript
function calculateMemberFitScore(member: UserDocument, opp: OpportunityDocument): number {
  let score = 0
  
  // Skill overlap (max 50 points)
  const requiredSkills = opp.constraints.requiredSkills
  const memberSkills = member.skillProfile.skills
  const overlap = requiredSkills.filter(s => memberSkills.includes(s))
  score += (overlap.length / requiredSkills.length) * 50
  
  // Skill proficiency (max 20 points)
  const avgProficiency = overlap
    .map(s => member.skillProfile.skillScores[s] ?? 50)
    .reduce((a, b) => a + b, 0) / (overlap.length || 1)
  score += (avgProficiency / 100) * 20
  
  // Past performance (max 20 points)
  score += Math.min(member.hackathonHistory.winRate * 0.2, 20)
  
  // Lab relevance (max 10 points)
  const techTrackToLab: Record<string, string> = {
    'AI/ML': 'McCarthy', 'Web': 'Norman',
    'IoT': 'Tesla', 'Web3': 'Satoshi'
  }
  const relevantTracks = opp.constraints.techTracks
    .filter(t => techTrackToLab[t] === member.labAffiliation)
  if (relevantTracks.length > 0) score += 10
  
  return Math.round(score)
}
```

---

### Agent 7: Dispatcher Agent
**Trigger:** `onDocumentUpdated` on `squad_recommendations` (approvalStatus → 'approved')
**Goal:** Send perfectly formatted, role-targeted notifications across all selected channels

```typescript
// Dispatcher builds a custom message per member per channel

async function dispatchNotification(recommendation: SquadRecommendationDocument) {
  const opportunity = await getOpportunity(recommendation.opportunityId)
  
  for (const squad of recommendation.squads) {
    for (const uid of squad.memberIds) {
      const member = await getUser(uid)
      const prefs = member.notificationPreferences
      const role = squad.memberRoles[uid]
      const score = squad.memberScores[uid]
      
      // Build personalized message
      const message = buildPersonalizedMessage(member, opportunity, squad, role, score)
      
      // Dispatch to each enabled channel in parallel
      const dispatches = []
      
      if (prefs.discord && prefs.discordHandle) {
        dispatches.push(sendDiscordDM(prefs.discordHandle, message.discord))
      }
      if (prefs.slack && prefs.slackId) {
        dispatches.push(sendSlackDM(prefs.slackId, message.slack))
      }
      if (prefs.email) {
        dispatches.push(sendEmail(member.email, message.email))
      }
      if (prefs.telegram && prefs.telegramChatId) {
        dispatches.push(sendTelegram(prefs.telegramChatId, message.telegram))
      }
      if (prefs.whatsapp && prefs.whatsappNumber) {
        dispatches.push(sendWhatsApp(prefs.whatsappNumber, message.whatsapp))
      }
      
      await Promise.allSettled(dispatches) // Never let one channel failure block others
    }
  }
  
  // Also dispatch to lab Discord channels (not individual DMs)
  await sendLabChannelNotification(opportunity, recommendation)
  
  // Update opportunity status → 'dispatched'
  // Log to activity_feed
  // Write to notifications collection (delivery receipts)
}
```

**Message Format (Discord example):**
```markdown
🎯 **You've been drafted — [Member Name]**

**[Hackathon Title]** — *[Organizer]*
━━━━━━━━━━━━━━━━━━━━━━━━━━
**Your Role:** [Assigned Role]
**Your Fit Score:** [Score]/100
**Team Win Probability:** [Overall Score]%
**Prize:** [Prize]
**Deadline:** [Registration Deadline]

**Why you were selected:**
[AI Rationale excerpt relevant to this member]

**Your squad:**
• [Member 1] — [Role]
• [Member 2] — [Role]
• [Member 3] — [Role]
• [Member 4] — [Role]

**Hardware Reserved:** [Items or "None required"]

[🔒 Commit & Lock Calendar] → [Dashboard Link]
[📋 View Full Brief] → [Dashboard Link]
```

---

### Agent 8: Calendar Locker Agent
**Trigger:** `onCall` Cloud Function (triggered when team lead clicks "Commit" in dashboard)
**Goal:** Atomic lock — update FSM, sync calendars, disable notifications

```typescript
// ATOMIC OPERATION — all or nothing using Firestore batch write

async function lockSquad(squadId: string, triggeredBy: string) {
  const squad = await getSquad(squadId)
  const opportunity = await getOpportunity(squad.opportunityId)
  
  // Firestore batch — atomic, cannot partially fail
  const batch = db.batch()
  
  // 1. Lock all squad members
  for (const member of squad.members) {
    const userRef = db.collection('users').doc(member.uid)
    batch.update(userRef, {
      status: 'LOCKED',
      currentLock: {
        squadId: squadId,
        opportunityId: squad.opportunityId,
        lockedUntil: opportunity.endDate
      }
    })
  }
  
  // 2. Update squad status
  const squadRef = db.collection('squads').doc(squadId)
  batch.update(squadRef, { status: 'competing', lockedAt: Timestamp.now() })
  
  // 3. Update opportunity status
  const oppRef = db.collection('opportunities').doc(squad.opportunityId)
  batch.update(oppRef, { status: 'locked' })
  
  // 4. Write activity log
  const activityRef = db.collection('activity_feed').doc()
  batch.set(activityRef, {
    type: 'member_locked',
    title: `Squad locked for ${opportunity.title}`,
    createdAt: Timestamp.now()
  })
  
  await batch.commit() // Atomic — either all succeed or all fail
  
  // 5. Google Calendar sync (outside batch — async)
  await Promise.all(squad.members.map(m =>
    syncGoogleCalendar(m.uid, opportunity)
  ))
  
  // 6. Disable further notifications for locked members
  // (Matchmaker and Dispatcher check status === 'AVAILABLE' before including anyone)
  
  // 7. Notify bench players of new available opportunity slots
  await notifyBenchPlayers(opportunity)
}
```

**Google Calendar Sync:**
```typescript
async function syncGoogleCalendar(uid: string, opportunity: OpportunityDocument) {
  const calendar = google.calendar({ version: 'v3', auth: await getOAuthClient(uid) })
  
  // Create main event (full hackathon duration)
  const mainEvent = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: `🏆 [LOCKED] ${opportunity.title}`,
      description: `NTL Squad deployed. Focus mode active.\n\nDo not accept other commitments.`,
      start: { dateTime: opportunity.startDate.toDate().toISOString() },
      end: { dateTime: opportunity.endDate.toDate().toISOString() },
      colorId: '11', // Red
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 },       // 1 hour before
        ]
      }
    }
  })
  
  // Create registration deadline event
  await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: `⚠️ Registration Deadline — ${opportunity.title}`,
      start: { dateTime: opportunity.registrationDeadline.toDate().toISOString() },
      end: { dateTime: opportunity.registrationDeadline.toDate().toISOString() },
      colorId: '6', // Orange
    }
  })
  
  return mainEvent.data.id
}
```

---

### Agent 9: Vault Archiver Agent
**Trigger:** `onSchedule` — daily at 3:00 AM IST
**Goal:** Detect completed hackathons, pull repos, analyze, archive
**Note: V2 feature — full Algolia integration**

```typescript
async function vaultArchiverAgent() {
  // Find all squads where hackathon has ended but vault not yet archived
  const completedSquads = await db.collection('squads')
    .where('status', '==', 'competing')
    .where('opportunity.endDate', '<', Timestamp.now())
    .get()
  
  for (const squadDoc of completedSquads.docs) {
    const squad = squadDoc.data() as SquadDocument
    
    if (!squad.result?.repoUrl) continue // Can't archive without repo
    
    // 1. Pull GitHub repo metadata via Octokit
    const repoData = await octokit.repos.get({ owner, repo })
    
    // 2. Pull file tree and key files
    const fileTree = await octokit.git.getTree({ ... recursive: true })
    const keyFiles = extractKeyFiles(fileTree) // package.json, README, main files
    
    // 3. Gemini analyzes the codebase
    const analysis = await analyzeCodebase(keyFiles, squad, opportunity)
    
    // 4. Write to knowledge_vault
    await db.collection('knowledge_vault').add({
      squadId: squad.id,
      opportunityId: squad.opportunityId,
      repoUrl: squad.result.repoUrl,
      analysis,
      searchableText: buildSearchableText(analysis),
      archivedAt: Timestamp.now(),
      archivedBy: 'vault_agent'
    })
    
    // 5. Update squad status → 'archived'
    await squadDoc.ref.update({ status: 'completed' })
    
    // 6. Unlock all squad members → 'AVAILABLE'
    for (const member of squad.members) {
      await db.collection('users').doc(member.uid).update({
        status: 'AVAILABLE',
        currentLock: { squadId: null, opportunityId: null, lockedUntil: null }
      })
    }
    
    // 7. Trigger Analytics Agent update for all members
    await updateMemberAnalytics(squad, opportunity)
    
    // 8. Log to activity_feed
  }
}
```

---

## 6. NOTIFICATION SYSTEM ARCHITECTURE

### Smart Batching Engine

```typescript
// Cloud Function: dailyNotificationDigest
// Runs every day at 8:00 AM IST

async function dailyDigest() {
  // Get all batched-tier opportunities added in last 24h
  const batchedOpportunities = await db.collection('opportunities')
    .where('aiScoring.notificationTier', '==', 'batched')
    .where('createdAt', '>', yesterday)
    .orderBy('aiScoring.valueScore', 'desc')
    .get()
  
  // Get all AVAILABLE members
  const availableMembers = await db.collection('users')
    .where('status', '==', 'AVAILABLE')
    .get()
  
  // Per member: filter opportunities relevant to THEIR skills
  for (const memberDoc of availableMembers.docs) {
    const member = memberDoc.data()
    const relevantOpps = batchedOpportunities.docs
      .filter(opp => isRelevantToMember(opp.data(), member))
      .slice(0, 5) // Max 5 per digest
    
    if (relevantOpps.length === 0) continue
    
    // Build personalized digest and send
    const digest = buildDailyDigest(relevantOpps, member)
    await sendToAllEnabledChannels(member, digest)
  }
}
```

### Channel Integration Details

**Discord:**
```typescript
// Webhook POST to lab-specific channel
async function sendDiscordWebhook(webhookUrl: string, embed: DiscordEmbed) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: embed.title,
        description: embed.description,
        color: 0x00FF66, // NTL neon green
        fields: embed.fields,
        footer: { text: 'NTL Intelligence Agent' },
        timestamp: new Date().toISOString()
      }]
    })
  })
}
```

**Email (Resend):**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail(to: string, content: EmailContent) {
  await resend.emails.send({
    from: 'NTL Intelligence <intel@ntl.srmist.edu.in>',
    to,
    subject: content.subject,
    html: renderEmailTemplate(content) // React Email template
  })
}
```

**Telegram:**
```typescript
import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)

async function sendTelegram(chatId: string, message: string) {
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
}
```

**WhatsApp (Twilio):**
```typescript
import twilio from 'twilio'
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

async function sendWhatsApp(to: string, message: string) {
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message
  })
}
```

---

## 7. CALENDAR LOCK SYSTEM

### Full Lock Lifecycle

```
Squad Commits
    │
    ▼
Atomic Firestore Batch
    ├── All members → status: 'LOCKED'
    ├── All members → currentLock: { squadId, opportunityId, lockedUntil }
    ├── Squad → status: 'competing'
    └── Opportunity → status: 'locked'
    │
    ▼
Google Calendar API (per member, parallel)
    ├── Create main competition event (red, full duration)
    ├── Create registration deadline event (orange)
    └── Create daily countdown reminders (3 days, 1 day, 1 hour before)
    │
    ▼
Notification Suppression
    └── Matchmaker queries WHERE status == 'AVAILABLE' only
    └── Dispatcher skips LOCKED members automatically
    └── Daily digest excludes LOCKED members
    │
    ▼
Bench Player Notification
    └── Dispatcher notifies AVAILABLE members:
        "Squad for [opportunity] is locked. More opportunities incoming."
    │
    ▼
HACKATHON ENDS (endDate passes)
    │
    ▼
Vault Agent runs (Agent 9)
    ├── Unlocks all members → status: 'AVAILABLE'
    ├── Clears currentLock
    └── Triggers analytics update
```

---

## 8. THE VAULT AGENT SYSTEM

### Knowledge Base Architecture

```
knowledge_vault collection (Firestore)
    └── Synced to Algolia (instant search)
    └── Firebase Storage (code snippets, extracted files)

Search Flow:
    Member types query in dashboard
    └── Algolia instant search over knowledge_vault
    └── Results ranked by: reusabilityScore + recency + tech stack match
    └── Member sees: project summary + key boilerplates + winning factors
    └── Can download: extracted code snippets from Firebase Storage
```

### Vault Query Interface (Natural Language)

```typescript
// onCall function: queryVault
async function queryVault(query: string, uid: string) {
  // 1. Algolia text search
  const algoliaResults = await algoliaIndex.search(query, { hitsPerPage: 10 })
  
  // 2. Gemini re-ranks results based on query intent
  const reranked = await gemini.generate({
    prompt: `
      User query: "${query}"
      Results: ${JSON.stringify(algoliaResults.hits)}
      
      Re-rank these results by relevance to the query.
      Return the top 5 most relevant, with a one-line explanation for each.
    `
  })
  
  return reranked
}
```

---

## 9. ANALYTICS & LEADERBOARD ENGINE

### Analytics Update Flow (Post-Hackathon)

```typescript
async function updateMemberAnalytics(squad: SquadDocument, opportunity: OpportunityDocument) {
  for (const member of squad.members) {
    const analyticsRef = db.collection('analytics').doc(member.uid)
    const existing = await analyticsRef.get()
    const data = existing.data() as MemberAnalyticsDocument
    
    // Update counts
    const newParticipations = data.totalParticipations + 1
    const newWins = squad.result?.placement === '1st' ? data.wins + 1 : data.wins
    const newWinRate = (newWins / newParticipations) * 100
    const newPrize = data.totalPrizeMoney + (squad.result?.prizeWon ?? 0)
    
    // Contribution score (AI-estimated based on role + placement + team rating)
    const contributionScore = await estimateContribution(member, squad, opportunity)
    
    // Update leaderboard rank
    await analyticsRef.update({
      totalParticipations: newParticipations,
      wins: newWins,
      winRate: newWinRate,
      totalPrizeMoney: newPrize,
      contributionScore: (data.contributionScore + contributionScore) / 2,
      eventHistory: [...data.eventHistory, {
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        role: squad.members.find(m => m.uid === member.uid)?.role,
        placement: squad.result?.placement ?? null,
        contribution: contributionScore,
        date: Timestamp.now()
      }]
    })
  }
  
  // Recalculate leaderboard ranks for all members
  await recalculateLeaderboard()
}
```

### Leaderboard Calculation

```typescript
async function recalculateLeaderboard() {
  const allAnalytics = await db.collection('analytics')
    .orderBy('contributionScore', 'desc')
    .get()
  
  // Composite score:
  // 40% win rate
  // 30% contribution score
  // 20% total participations (normalized)
  // 10% prize money (normalized)
  
  const batch = db.batch()
  allAnalytics.docs.forEach((doc, index) => {
    batch.update(doc.ref, { leaderboardRank: index + 1 })
  })
  await batch.commit()
}
```

---

## 10. FRONTEND ARCHITECTURE (FULL APP)

### Route Structure

```
app/
├── (auth)/
│   ├── login/page.tsx              Google Sign-In (domain-restricted)
│   └── onboarding/page.tsx         Profile setup (GitHub + LinkedIn intake)
│
├── (dashboard)/
│   ├── layout.tsx                  Dashboard shell (sidebar + topbar)
│   │
│   ├── war-room/page.tsx           [board_lead+] Full command center
│   ├── opportunities/
│   │   ├── page.tsx                All opportunities list
│   │   └── [id]/page.tsx           Single opportunity detail + squad review
│   ├── squads/
│   │   ├── page.tsx                All squads (active + completed)
│   │   └── [id]/page.tsx           Single squad detail
│   ├── members/
│   │   ├── page.tsx                [board_lead+] Full member roster
│   │   └── [uid]/page.tsx          Individual member profile
│   ├── vault/page.tsx              Knowledge base search
│   ├── leaderboard/page.tsx        Public performance leaderboard
│   ├── hardware/page.tsx           [board_lead+] Tesla Lab inventory
│   ├── analytics/page.tsx          [board_lead+] System analytics
│   ├── settings/page.tsx           Member notification preferences
│   └── profile/page.tsx            Own profile management
│
└── api/
    ├── auth/callback/route.ts      OAuth callback
    ├── webhooks/discord/route.ts   Discord confirmation receiver
    └── cron/scout/route.ts         Manual scout trigger (super_admin)
```

### The War Room Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [NTL//] INTELLIGENCE          [●] System Online    [Chaitanya ▾]│
├──────────────┬───────────────────────────────────────────────────┤
│              │  WAR ROOM                        [Aug 25, 2026]   │
│  [War Room]  ├──────────────────────────────────────────────────┤
│              │  LIVE STATS STRIP                                  │
│  [Opps]      │  47 Indexed | 3 Locked | 96% Avg Score | 0 Manual│
│              ├──────────┬────────────────────────────────────────┤
│  [Squads]    │ ACTIVITY │  OPPORTUNITY KANBAN                    │
│              │ FEED     │                                        │
│  [Members]   │          │  [ANALYZING] [DRAFTED] [DISPATCHED]   │
│              │ 14:32    │                                        │
│  [Vault]     │ Scout    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│              │ found    │  │ ETHIndia│ │ HackMIT │ │ FOSSHack│ │
│  [Leaderbd]  │ ETHIndia │  │ 96% ★  │ │ 88% ★  │ │ 74% ★  │ │
│              │          │  │ AI/Web3 │ │ Web/IoT │ │ Open Src│ │
│  [Hardware]  │ 14:28    │  │ $50K   │ │ $25K   │ │ $5K    │ │
│              │ Squad    │  │ [Draft] │ │[Pending]│ │[Batched]│ │
│  [Analytics] │ drafted  │  └─────────┘ └─────────┘ └─────────┘ │
│              │ for MIT  ├────────────────────────────────────────┤
│  [Settings]  │          │  MEMBER STATUS MATRIX                  │
│              │ 14:15    │                                        │
│              │ Member   │  ● Available (38)  ◐ Reviewing (4)    │
│              │ locked   │  ● Locked (5)      ○ Recruit (6)      │
└──────────────┴──────────┴────────────────────────────────────────┘
```

### Member Personal Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  YOUR DASHBOARD — [Member Name]              [● AVAILABLE]       │
├───────────────────────────┬──────────────────────────────────────┤
│  YOUR PROFILE             │  YOUR OPPORTUNITIES                  │
│  ┌─────────────────────┐  │  ┌──────────────────────────────┐   │
│  │ [Avatar]            │  │  │ 🔥 ETHIndia 2026             │   │
│  │ Name                │  │  │  Your role: Next.js Lead      │   │
│  │ McCarthy Lab        │  │  │  Fit score: 98/100            │   │
│  │ Skills: [pills]     │  │  │  [View Brief] [Commit]        │   │
│  │ Win rate: 73%       │  │  └──────────────────────────────┘   │
│  │ Rank: #3            │  │                                      │
│  └─────────────────────┘  │  ┌──────────────────────────────┐   │
│                           │  │ 📬 HackMIT 2026 (Digest)     │   │
│  UPCOMING LOCKS           │  │  Skill match: 71%             │   │
│  ┌─────────────────────┐  │  │  [View Details]               │   │
│  │ ETHIndia — Aug 15   │  │  └──────────────────────────────┘   │
│  │ 23 days remaining   │  │                                      │
│  │ [View Calendar]     │  ├──────────────────────────────────────┤
│  └─────────────────────┘  │  YOUR STATS                          │
│                           │  Participations: 7 | Wins: 3         │
│  NOTIFICATION SETTINGS    │  Prize Money: $12,500                 │
│  Discord ✅ Email ✅       │  Contribution Score: 847             │
│  Telegram ✅ Slack ❌      │                                      │
│  WhatsApp ❌              │  [VIEW FULL ANALYTICS]               │
└───────────────────────────┴──────────────────────────────────────┘
```

---

## 11. UI COMPONENT SYSTEM

### Design Language (Same as Demo — Production Consistent)

```typescript
:root {
  --color-bg:          #030303;
  --color-surface:     #0D0E12;
  --color-surface-2:   #12141A;
  --color-border:      #1F242E;
  --color-primary:     #00FF66;   // Available, success, CTA
  --color-secondary:   #00E5FF;   // Agent activity, system
  --color-danger:      #FF3B3B;   // Locked, danger, emergency
  --color-warning:     #FFB800;   // Reviewing, pending
  --color-text-primary:#F0F2F5;
  --color-text-secondary:#8F96A3;
}
```

### Core Component Library

```
components/
├── ui/
│   ├── StatusBadge.tsx            Available/Reviewing/Locked/Recruit
│   ├── OpportunityCard.tsx        Hackathon card with score + tracks
│   ├── MemberCard.tsx             Member profile card with status
│   ├── SquadCard.tsx              Squad overview card
│   ├── ActivityFeedItem.tsx       Single activity feed entry
│   ├── MatchScoreBadge.tsx        Win probability pill
│   ├── SkillPill.tsx              Individual skill tag
│   ├── StatCard.tsx               Animated stat counter card
│   ├── GlowButton.tsx             Primary CTA button
│   ├── TerminalText.tsx           Monospace terminal-style text
│   └── RoleGate.tsx               Role-based content wrapper
│
├── dashboard/
│   ├── Sidebar.tsx                Navigation sidebar with role-aware links
│   ├── Topbar.tsx                 Top navigation with status + user menu
│   ├── ActivityFeed.tsx           Real-time Firestore-synced activity log
│   ├── OpportunityKanban.tsx      Drag-column kanban for opportunities
│   ├── MemberStatusMatrix.tsx     Visual grid of all member statuses
│   ├── WarRoomStats.tsx           Live stats strip
│   └── NotificationBell.tsx      In-app notification center
│
├── opportunities/
│   ├── OpportunityList.tsx        Filterable, sortable opportunity table
│   ├── OpportunityDetail.tsx      Full opportunity page
│   ├── TacticalBriefPanel.tsx     Deep research results (V2)
│   └── SquadReviewPanel.tsx       Board lead squad approval UI
│
├── squads/
│   ├── SquadDraftCard.tsx         Pending squad awaiting approval
│   ├── SquadLiveCard.tsx          Active competing squad
│   ├── CommitButton.tsx           Lock squad + calendar sync trigger
│   └── EmergencySubButton.tsx     Panic button UI
│
├── members/
│   ├── MemberRoster.tsx           Full 50-100 member grid
│   ├── MemberProfile.tsx          Individual profile page
│   ├── SkillRadar.tsx             Radar chart of skills (Recharts)
│   └── OnboardingFlow.tsx         GitHub + LinkedIn intake wizard
│
├── vault/
│   ├── VaultSearch.tsx            Algolia-powered search bar
│   ├── VaultResultCard.tsx        Single vault entry card
│   └── BoilerplateViewer.tsx      Code snippet viewer (V2)
│
├── leaderboard/
│   ├── LeaderboardTable.tsx       Ranked member table
│   └── MemberRankCard.tsx         Individual rank card
│
└── analytics/
    ├── WinRateChart.tsx            Line chart — win rate over time
    ├── TokenTelemetryChart.tsx     Token burn vs ROI graph (super_admin)
    ├── SkillGrowthChart.tsx        Per-skill score history
    └── OpportunityROITable.tsx     Prize per event analysis
```

---

## 12. V1 VS V2 FEATURE SPLIT

### V1 — Ship This First (Core System)

| Feature | Status | Notes |
|---|---|---|
| Firebase Auth (Google, domain-restricted) | ✅ V1 | Non-negotiable foundation |
| Role system (5 roles) | ✅ V1 | Must work before anything else |
| Member onboarding (GitHub only) | ✅ V1 | LinkedIn + resume in V2 |
| Scout Agent (4 sources: MLH, Devpost, Unstop, HackerEarth) | ✅ V1 | Full source list in V2 |
| Deduplicator Agent | ✅ V1 | Prevents noise from day 1 |
| Analyzer Agent (Gemini tagging + scoring) | ✅ V1 | Core intelligence |
| Value Filter (instant vs batched) | ✅ V1 | Controls notification noise |
| Matchmaker Agent (single squad, basic scoring) | ✅ V1 | Core value delivery |
| Board Lead approval workflow | ✅ V1 | Human control layer |
| Discord + Email notifications | ✅ V1 | Two most-used channels |
| Calendar Lock (Google Calendar sync) | ✅ V1 | Core FSM feature |
| Member FSM (Available/Reviewing/Locked) | ✅ V1 | Foundation of routing |
| War Room dashboard | ✅ V1 | Board lead interface |
| Member personal dashboard | ✅ V1 | All-member interface |
| Basic post-hackathon result logging | ✅ V1 | Manual entry by board lead |
| Leaderboard (basic) | ✅ V1 | Motivates members |
| Activity feed | ✅ V1 | Makes system feel alive |

### V2 — After NTL Validates V1

| Feature | Status | Notes |
|---|---|---|
| Member onboarding (+ LinkedIn + resume) | 🔄 V2 | Richer skill profiles |
| Scout Agent (all sources: Reddit, Twitter, Telegram, RSS) | 🔄 V2 | Full global coverage |
| Telegram + Slack + WhatsApp notifications | 🔄 V2 | Full omnichannel |
| Deep Research Agents (4 parallel Cloud Tasks) | 🔄 V2 | Tactical brief engine |
| Multiple squad drafting per opportunity | 🔄 V2 | When roster is large enough |
| Vault Agent (auto-archive + Algolia search) | 🔄 V2 | Institutional memory |
| Mock Judge Pitch Simulator (Gemini Vision) | 🔄 V2 | Pitch prep tool |
| Tesla Lab Hardware Inventory Manager | 🔄 V2 | Physical asset tracking |
| Emergency Sub Protocol | 🔄 V2 | Crisis management |
| Full analytics engine (skill growth, ROI) | 🔄 V2 | Deep performance data |
| Token Telemetry dashboard | 🔄 V2 | Cost optimization (super_admin) |
| Boilerplate Generator (from Vault) | 🔄 V2 | Day-1 head start |
| Multi-tenant (other clubs) | 🔄 V3 | Scale beyond NTL |

---

## 13. BUILD PHASES, BATCHES, TASKS & SUBTASKS

---

### ═══ PHASE 0: INFRASTRUCTURE FOUNDATION ═══
**Duration: Days 1–3 | Goal: Firebase project live, auth working, design system ready**

---

#### BATCH 0.1 — Firebase Project Setup
**Est. Time: 3 hours**

**Task 0.1.1 — Create Firebase Project**
- [ ] Go to console.firebase.google.com → New Project: `ntl-intelligence-prod`
- [ ] Enable Google Analytics
- [ ] Set region: `asia-south1` (Mumbai — lowest latency for SRM)
- [ ] Upgrade to Blaze plan (required for Cloud Functions external calls)

**Task 0.1.2 — Enable Firebase Services**
- [ ] Authentication → Enable Google Sign-In provider
- [ ] Firestore → Create database in `asia-south1`, start in production mode
- [ ] Cloud Storage → Enable, `asia-south1`
- [ ] Cloud Functions → Enable (comes with Blaze plan)
- [ ] Firebase App Hosting → Enable for Next.js deployment

**Task 0.1.3 — Initialize Local Project**
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select: Firestore, Functions, Storage, App Hosting, Emulators
# Functions runtime: Node.js 20
# Emulators: Auth, Firestore, Functions, Storage
```

**Task 0.1.4 — Configure Google Cloud APIs**
- [ ] Enable: Google Calendar API, Google People API
- [ ] Enable: Cloud Tasks API
- [ ] Create Service Account for server-side operations
- [ ] Download service account JSON → store as Firebase Secret

**Task 0.1.5 — Next.js Project Init**
```bash
npx create-next-app@latest ntl-intelligence-app --typescript --tailwind --app --turbopack
cd ntl-intelligence-app
npm install firebase firebase-admin framer-motion lucide-react recharts clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button badge card dialog tooltip separator sheet dropdown-menu
```

---

#### BATCH 0.2 — Authentication System
**Est. Time: 4 hours**

**Task 0.2.1 — Firebase Auth Configuration**
```typescript
// lib/firebase/auth.ts
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const ALLOWED_DOMAINS = ['srmist.edu.in', 'nexttechlab.in']

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ hd: ALLOWED_DOMAINS[0] })
  const result = await signInWithPopup(auth, provider)
  
  // Domain validation
  const email = result.user.email ?? ''
  const domain = email.split('@')[1]
  if (!ALLOWED_DOMAINS.includes(domain)) {
    await signOut(auth)
    throw new Error('ACCESS_DENIED: NTL Board Clearance Required')
  }
  
  return result.user
}
```

**Task 0.2.2 — Role Assignment Cloud Function**
```typescript
// functions/src/auth/onUserCreate.ts
// Firebase Auth trigger — fires when new user signs in for first time

export const onUserCreate = onDocumentCreated('users/{uid}', async (event) => {
  // New user defaults to 'recruit' role
  // Board lead must approve and set role manually
  // Custom claims are set via admin SDK when role is assigned
})

export const setUserRole = onCall(async (request) => {
  // Only board_lead or super_admin can call this
  if (!isAuthorized(request.auth, ['board_lead', 'super_admin'])) {
    throw new HttpsError('permission-denied', 'Unauthorized')
  }
  await admin.auth().setCustomUserClaims(request.data.uid, {
    role: request.data.role
  })
})
```

**Task 0.2.3 — Login Page**
- [ ] `/app/(auth)/login/page.tsx`
- [ ] Google Sign-In button (GlowButton)
- [ ] Terminal-style "Access Denied" error state
- [ ] NTL branding (minimal, dark, cinematic)
- [ ] Redirect to `/onboarding` if new user, `/war-room` if board lead, `/dashboard` if member

**Task 0.2.4 — Onboarding Flow**
- [ ] Step 1: GitHub URL input → trigger profile build (V1: GitHub only)
- [ ] Step 2: Notification preferences selection (channel checkboxes + handle inputs)
- [ ] Step 3: Review auto-extracted skills → confirm or edit
- [ ] Completion → status set to RECRUIT, board lead notified for approval

**Task 0.2.5 — Auth Middleware (Next.js)**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session')?.value
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Role-based route protection
  const role = decodeTokenRole(token)
  if (request.nextUrl.pathname.startsWith('/war-room') && 
      !['board_lead', 'super_admin'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

---

#### BATCH 0.3 — Firestore Setup & Security Rules
**Est. Time: 3 hours**

**Task 0.3.1 — Deploy Firestore Indexes**
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "labAffiliation", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "opportunities",
      "fields": [
        { "fieldPath": "aiScoring.notificationTier", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "opportunities",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "aiScoring.valueScore", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Task 0.3.2 — Deploy Security Rules**
- [ ] Write full Firestore security rules (reference Section 2)
- [ ] Test all rules in Firebase Emulator before deploying

**Task 0.3.3 — Seed system_config Document**
- [ ] Write seed script to create initial `system_config/global` document
- [ ] Set default thresholds, lab configs, enabled sources

---

#### BATCH 0.4 — Design System
**Est. Time: 2 hours**
- [ ] Identical to landing page design system — see landing page doc Section 3
- [ ] Add dashboard-specific tokens: sidebar width, topbar height
- [ ] Configure globals.css with all CSS variables
- [ ] Set up Tailwind config with all custom tokens
- [ ] Build all shared UI primitives (StatusBadge, GlowButton, etc.)

---

### ═══ PHASE 1: MEMBER PROFILE PIPELINE ═══
**Duration: Days 4–5 | Goal: GitHub-powered skill ingestion working end to end**

---

#### BATCH 1.1 — GitHub Profile Analyzer
**Est. Time: 4 hours**

**Task 1.1.1 — GitHub API Integration**
```typescript
// functions/src/profiles/analyzeGithub.ts
import { Octokit } from '@octokit/rest'

export const analyzeGithubProfile = onCall(async (request) => {
  const { githubUrl } = request.data
  const username = extractUsername(githubUrl)
  
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  
  // Fetch all public repos
  const repos = await octokit.repos.listForUser({ username, per_page: 100 })
  
  // Extract languages per repo
  const languageData = await Promise.all(
    repos.data.slice(0, 20).map(repo => // Limit to 20 most recent
      octokit.repos.listLanguages({ owner: username, repo: repo.name })
    )
  )
  
  // Aggregate language usage
  const aggregated = aggregateLanguages(languageData)
  
  // Detect frameworks from repo names, topics, README keywords
  const frameworks = detectFrameworks(repos.data)
  
  // Send to Gemini for skill classification
  const skillProfile = await classifySkills(aggregated, frameworks, repos.data)
  
  // Write to user document
  await db.collection('users').doc(request.auth!.uid).update({
    'skillProfile.skills': skillProfile.skills,
    'skillProfile.skillScores': skillProfile.scores,
    'skillProfile.primaryRole': skillProfile.primaryRole,
    'skillProfile.githubUrl': githubUrl,
    'skillProfile.lastProfileSync': Timestamp.now()
  })
})
```

**Task 1.1.2 — Gemini Skill Classifier**
```typescript
async function classifySkills(languages, frameworks, repos) {
  const result = await generate({
    model: gemini20Flash,
    prompt: `
      Analyze this GitHub developer profile and extract their skills.
      
      Languages used: ${JSON.stringify(languages)}
      Detected frameworks: ${JSON.stringify(frameworks)}
      Repository topics: ${repos.flatMap(r => r.topics).join(', ')}
      
      Return strict JSON:
      {
        "skills": ["Next.js", "Firebase", "Python", ...], // max 15 most significant
        "skillScores": { "Next.js": 87, "Python": 72, ... }, // 0-100 proficiency estimate
        "primaryRole": "Full-Stack Web Developer" // one sentence
      }
    `,
    output: { schema: SkillProfileSchema }
  })
  return result.output
}
```

**Task 1.1.3 — Onboarding UI**
- [ ] GitHub URL input with validation
- [ ] Loading state: animated terminal showing "Analyzing repositories..."
- [ ] Results display: skill pills with proficiency scores
- [ ] Editable: member can add/remove skills manually
- [ ] Confirm button → writes to Firestore + updates status

---

### ═══ PHASE 2: SCOUT + ANALYZER AGENTS ═══
**Duration: Days 6–8 | Goal: Opportunities appearing in Firestore automatically**

---

#### BATCH 2.1 — Scout Agent (Cloud Function)
**Est. Time: 5 hours**

**Task 2.1.1 — MLH Scraper**
```typescript
async function scrapeMlh(): Promise<RawOpportunity[]> {
  // MLH has a public API and calendar
  const response = await fetch('https://mlh.io/events.json')
  const events = await response.json()
  return events.map(formatMlhEvent)
}
```

**Task 2.1.2 — Devpost Scraper**
```typescript
async function scrapeDevpost(): Promise<RawOpportunity[]> {
  const response = await fetch('https://devpost.com/api/hackathons?status=upcoming')
  const data = await response.json()
  return data.hackathons.map(formatDevpostEvent)
}
```

**Task 2.1.3 — Unstop + HackerEarth Scrapers**
- [ ] Unstop API integration (they have a public endpoint)
- [ ] HackerEarth API integration
- [ ] Format all raw data consistently

**Task 2.1.4 — onSchedule Cron Setup**
```typescript
// Fires every 6 hours
export const scoutAgent = onSchedule('every 6 hours', async () => {
  const sources = [scrapeMlh, scrapeDevpost, scrapeUnstop, scrapeHackerEarth]
  const results = await Promise.allSettled(sources.map(s => s()))
  
  let indexed = 0
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const opp of result.value) {
        await db.collection('raw_opportunities').add({
          ...opp,
          scrapedAt: Timestamp.now(),
          processingStatus: 'pending'
        })
        indexed++
      }
    }
  }
  
  await db.collection('system_config').doc('global').update({
    lastAgentRun: Timestamp.now(),
    totalOpportunitiesIndexed: FieldValue.increment(indexed)
  })
})
```

---

#### BATCH 2.2 — Analyzer Agent
**Est. Time: 5 hours**

**Task 2.2.1 — Firestore Trigger**
```typescript
export const analyzerAgent = onDocumentCreated('raw_opportunities/{docId}', async (event) => {
  const rawDoc = event.data
  if (!rawDoc) return
  
  // 1. Run deduplication check
  const isDuplicate = await checkDuplicate(rawDoc.data().sourceUrl)
  if (isDuplicate) {
    await rawDoc.ref.delete()
    return
  }
  
  // 2. Run Gemini analysis
  const structured = await analyzerFlow(rawDoc.data().rawText)
  
  // 3. Calculate value score
  const valueScore = calculateValueScore(structured)
  const notificationTier = valueScore >= 80 ? 'instant' : valueScore >= 50 ? 'batched' : 'archived'
  
  // 4. Write to opportunities
  await db.collection('opportunities').add({
    ...structured,
    aiScoring: { valueScore, notificationTier },
    status: 'analyzed',
    createdAt: Timestamp.now()
  })
  
  // 5. Delete raw document
  await rawDoc.ref.delete()
  
  // 6. Log activity
  await logActivity('opportunity_found', structured.title)
})
```

**Task 2.2.2 — Gemini Analyzer Flow**
- [ ] Write full Genkit flow (reference Section 5 Agent 3)
- [ ] Write Zod schema for structured output validation
- [ ] Test with 10+ real hackathon pages
- [ ] Handle edge cases: missing dates, unclear tech tracks, non-English content

---

### ═══ PHASE 3: MATCHMAKER AGENT ═══
**Duration: Days 9–10 | Goal: Squads being drafted automatically**

---

#### BATCH 3.1 — Matchmaker Implementation
**Est. Time: 6 hours**

**Task 3.1.1 — Member Fit Score Algorithm**
- [ ] Implement `calculateMemberFitScore()` (reference Section 5 Agent 6)
- [ ] Test against 20 simulated member + opportunity combinations
- [ ] Calibrate weights until results feel correct

**Task 3.1.2 — Squad Assembly Logic**
- [ ] Single squad drafting (V1)
- [ ] Role assignment based on opportunity tracks and member skills
- [ ] Hardware auto-reservation check
- [ ] Rationale generation via Gemini

**Task 3.1.3 — Firestore Trigger**
```typescript
export const matchmakerAgent = onDocumentCreated('opportunities/{oppId}', async (event) => {
  const opp = event.data?.data() as OpportunityDocument
  
  // Only run matchmaker for instant and batched tier
  if (opp.aiScoring.notificationTier === 'archived') return
  
  await matchmaker(opp)
})
```

**Task 3.1.4 — Squad Approval Notification**
- [ ] When squad is drafted, notify board leads via Discord + Email
- [ ] Include: opportunity summary, squad list, match scores, rationale
- [ ] Include: direct link to approval UI in dashboard

---

### ═══ PHASE 4: DISPATCHER AGENT + NOTIFICATION SYSTEM ═══
**Duration: Days 11–12 | Goal: Members receiving personalized notifications**

---

#### BATCH 4.1 — Discord + Email Integration
**Est. Time: 4 hours**

**Task 4.1.1 — Discord Webhook Integration**
- [ ] Configure webhooks per lab channel in system_config
- [ ] Build Discord embed formatter
- [ ] Test with real Discord server

**Task 4.1.2 — Resend Email Integration**
- [ ] Sign up for Resend API, configure domain
- [ ] Build React Email templates for:
  - Opportunity alert
  - Squad draft notification
  - Squad approved + dispatch
  - Calendar lock confirmation
  - Daily digest

**Task 4.1.3 — Dispatcher Cloud Function**
- [ ] Implement full dispatcher (reference Section 5 Agent 7)
- [ ] Test delivery receipt tracking
- [ ] Test `Promise.allSettled` — one failed channel must not block others

**Task 4.1.4 — Daily Digest Function**
- [ ] Implement `dailyNotificationDigest` (reference Section 6)
- [ ] Schedule at 8:00 AM IST via `onSchedule`
- [ ] Test with simulated batched opportunities

---

### ═══ PHASE 5: CALENDAR LOCK SYSTEM ═══
**Duration: Day 13 | Goal: One-click squad commit that syncs Google Calendar**

---

#### BATCH 5.1 — Calendar Lock Implementation
**Est. Time: 4 hours**

**Task 5.1.1 — Google Calendar OAuth**
- [ ] Configure OAuth 2.0 credentials in Google Cloud Console
- [ ] Implement per-user OAuth token storage (encrypted in Firestore)
- [ ] Handle token refresh

**Task 5.1.2 — Calendar Sync Function**
- [ ] Implement `syncGoogleCalendar()` (reference Section 7)
- [ ] Test with real Google Calendar account
- [ ] Verify events appear correctly (color, title, reminders)

**Task 5.1.3 — Atomic Lock Transaction**
- [ ] Implement Firestore batch write (reference Section 5 Agent 8)
- [ ] Test rollback: if Calendar sync fails, Firestore changes must not persist
- [ ] Test with 4 members simultaneously

**Task 5.1.4 — Commit UI**
- [ ] `CommitButton.tsx` — shows loading state during atomic operation
- [ ] Success state: lock icon + confirmation message
- [ ] Error state: clear error message + retry option

---

### ═══ PHASE 6: WAR ROOM DASHBOARD ═══
**Duration: Days 14–16 | Goal: Board lead command center fully functional**

---

#### BATCH 6.1 — Real-Time Data Layer
**Est. Time: 3 hours**

**Task 6.1.1 — Firestore Real-Time Hooks**
```typescript
// hooks/useRealtimeData.ts

// Real-time opportunities listener
export function useOpportunities(tier?: string) {
  const [opportunities, setOpportunities] = useState<OpportunityDocument[]>([])
  
  useEffect(() => {
    let query = db.collection('opportunities').orderBy('aiScoring.valueScore', 'desc')
    if (tier) query = query.where('aiScoring.notificationTier', '==', tier)
    
    const unsubscribe = query.onSnapshot(snapshot => {
      setOpportunities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    
    return () => unsubscribe()
  }, [tier])
  
  return opportunities
}

// Real-time activity feed
export function useActivityFeed(limit = 20) {
  const [feed, setFeed] = useState<ActivityFeedDocument[]>([])
  
  useEffect(() => {
    const unsubscribe = db.collection('activity_feed')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .onSnapshot(snapshot => {
        setFeed(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      })
    
    return () => unsubscribe()
  }, [limit])
  
  return feed
}
```

**Task 6.1.2 — Member Status Real-Time Hook**
- [ ] `useMembers()` — real-time roster with status
- [ ] `useMemberCount()` — counts by status (for stats strip)
- [ ] `useSquads()` — active squads real-time

---

#### BATCH 6.2 — War Room UI Components
**Est. Time: 6 hours**

**Task 6.2.1 — Live Stats Strip**
- [ ] 4 counters: Indexed / Locked / Avg Score / Manual Hours
- [ ] Animated count-up on mount
- [ ] Real-time updates from Firestore

**Task 6.2.2 — Opportunity Kanban**
- [ ] 4 columns: Analyzing / Drafted / Dispatched / Locked
- [ ] Cards: title, value score badge, tech track pills, prize
- [ ] Click card → slide panel with full detail + squad review

**Task 6.2.3 — Activity Feed**
- [ ] Real-time Firestore listener
- [ ] Icon per activity type
- [ ] Relative timestamps (2 min ago, 1 hour ago)
- [ ] Smooth slide-in animation for new entries

**Task 6.2.4 — Member Status Matrix**
- [ ] Grid of all 50–100 members
- [ ] Color-coded by status (green/yellow/red/gray)
- [ ] Click member → member profile slide panel
- [ ] Filter by lab, status, skill

**Task 6.2.5 — Squad Approval UI**
- [ ] Pending squad cards: show all members, scores, rationale
- [ ] Approve button → triggers Dispatcher Agent
- [ ] Edit button → drag-and-drop member swap
- [ ] Reject button with reason note

---

### ═══ PHASE 7: MEMBER PERSONAL DASHBOARD ═══
**Duration: Days 17–18 | Goal: Every member has their own personalized space**

---

#### BATCH 7.1 — Personal Dashboard
**Est. Time: 5 hours**

**Task 7.1.1 — My Opportunities Panel**
- [ ] Shows opportunities where this member was drafted
- [ ] Sorted by fit score descending
- [ ] Each item: opportunity title, role assigned, score, deadline
- [ ] "View Brief" → opportunity detail page
- [ ] "Commit" → calendar lock flow

**Task 7.1.2 — My Stats Panel**
- [ ] Participations, wins, win rate, prize money, rank
- [ ] Contribution score with tooltip explanation
- [ ] Leaderboard position (#3 of 47)

**Task 7.1.3 — My Notification Preferences**
- [ ] Toggle each channel on/off
- [ ] Input fields for handles (Discord, Telegram, WhatsApp)
- [ ] Save → updates Firestore immediately
- [ ] Test notification button per channel

**Task 7.1.4 — My Current Lock Panel**
- [ ] Shows active competition (if LOCKED)
- [ ] Days remaining countdown
- [ ] Link to Google Calendar event
- [ ] Team member list

---

### ═══ PHASE 8: LEADERBOARD + BASIC ANALYTICS ═══
**Duration: Day 19 | Goal: Visible performance tracking from day 1**

---

#### BATCH 8.1 — Leaderboard
**Est. Time: 3 hours**

**Task 8.1.1 — Leaderboard Table**
- [ ] Ranked by composite score
- [ ] Columns: Rank, Name, Lab, Wins, Win Rate, Prize Total, Score
- [ ] Filters: by lab, by time period (this semester, all time)
- [ ] Row highlight: current logged-in user

**Task 8.1.2 — Basic Analytics Charts (Recharts)**
- [ ] Win rate over time (line chart, per member)
- [ ] Opportunities by tech track (pie chart, system-wide)
- [ ] Prize money accumulation (bar chart)

---

### ═══ PHASE 9: POLISH, TESTING & DEPLOYMENT ═══
**Duration: Days 20–23 | Goal: Production-ready, zero-bug V1**

---

#### BATCH 9.1 — Firebase Emulator Testing
**Est. Time: 4 hours**

**Task 9.1.1 — Full Agent Pipeline Test**
- [ ] Create test raw_opportunity document manually
- [ ] Watch Analyzer Agent trigger, parse, write to opportunities
- [ ] Watch Matchmaker Agent draft squad
- [ ] Approve squad → watch Dispatcher trigger
- [ ] Click Commit → watch Calendar Lock fire
- [ ] Verify all Firestore writes are correct

**Task 9.1.2 — Security Rules Testing**
- [ ] Test every role's access to every collection
- [ ] Verify recruit cannot see war room
- [ ] Verify lab_member cannot approve squads
- [ ] Verify LOCKED member is not included in matchmaker queries

**Task 9.1.3 — Notification Testing**
- [ ] Send real Discord webhook to test server
- [ ] Send real email via Resend
- [ ] Verify personalized content is correct per member

---

#### BATCH 9.2 — Performance & Mobile
**Est. Time: 3 hours**

**Task 9.2.1 — Lighthouse Run**
- [ ] Performance 90+
- [ ] Accessibility 85+
- [ ] Fix any blocking issues

**Task 9.2.2 — Mobile Responsiveness**
- [ ] Sidebar: collapse to hamburger on mobile
- [ ] War Room Kanban: stack columns vertically on mobile
- [ ] All tables: horizontal scroll on mobile
- [ ] Touch targets: 44×44px minimum

---

#### BATCH 9.3 — Deployment
**Est. Time: 2 hours**

**Task 9.3.1 — Firebase App Hosting Deploy**
```bash
firebase apphosting:backends:create --project ntl-intelligence-prod
firebase deploy --only apphosting
```

**Task 9.3.2 — Cloud Functions Deploy**
```bash
firebase deploy --only functions
```

**Task 9.3.3 — Firestore Rules & Indexes Deploy**
```bash
firebase deploy --only firestore
```

**Task 9.3.4 — Environment Variables**
- [ ] Store all API keys as Firebase Secrets
- [ ] GEMINI_API_KEY, GITHUB_TOKEN, RESEND_API_KEY
- [ ] DISCORD_WEBHOOKS (JSON per lab), TELEGRAM_BOT_TOKEN
- [ ] TWILIO_SID, TWILIO_AUTH_TOKEN (V2)

**Task 9.3.5 — Production Smoke Test**
- [ ] Sign in with @srmist.edu.in Google account
- [ ] Complete onboarding with a real GitHub URL
- [ ] Manually trigger Scout Agent and watch pipeline
- [ ] Verify war room loads with real data
- [ ] Verify activity feed is live

---

## 14. FILE & FOLDER STRUCTURE

```
ntl-intelligence/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── war-room/page.tsx
│   │   ├── opportunities/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── squads/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── members/
│   │   │   ├── page.tsx
│   │   │   └── [uid]/page.tsx
│   │   ├── vault/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── hardware/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── profile/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   └── webhooks/discord/route.ts
│   ├── layout.tsx
│   ├── page.tsx                      # Redirects to /login
│   └── globals.css
│
├── components/
│   ├── ui/                           # Design system primitives
│   ├── dashboard/                    # Dashboard shell components
│   ├── opportunities/                # Opportunity-specific components
│   ├── squads/                       # Squad-specific components
│   ├── members/                      # Member profile components
│   ├── vault/                        # Knowledge base components
│   ├── leaderboard/                  # Leaderboard components
│   └── analytics/                    # Chart components
│
├── functions/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── scoutAgent.ts
│   │   │   ├── analyzerAgent.ts
│   │   │   ├── matchmakerAgent.ts
│   │   │   ├── dispatcherAgent.ts
│   │   │   ├── calendarLocker.ts
│   │   │   └── vaultArchiver.ts      # V2
│   │   ├── notifications/
│   │   │   ├── discord.ts
│   │   │   ├── email.ts
│   │   │   ├── telegram.ts           # V2
│   │   │   ├── whatsapp.ts           # V2
│   │   │   └── dispatcher.ts
│   │   ├── profiles/
│   │   │   ├── analyzeGithub.ts
│   │   │   └── classifySkills.ts
│   │   ├── auth/
│   │   │   ├── onUserCreate.ts
│   │   │   └── setUserRole.ts
│   │   ├── scrapers/
│   │   │   ├── mlh.ts
│   │   │   ├── devpost.ts
│   │   │   ├── unstop.ts
│   │   │   └── hackerearth.ts
│   │   ├── genkit/
│   │   │   ├── flows/
│   │   │   │   ├── analyzeOpportunity.ts
│   │   │   │   ├── classifySkills.ts
│   │   │   │   ├── generateRationale.ts
│   │   │   │   └── analyzeCodebase.ts  # V2
│   │   │   └── schemas/
│   │   │       ├── opportunity.schema.ts
│   │   │       └── skillProfile.schema.ts
│   │   └── index.ts                  # All function exports
│   ├── package.json
│   └── tsconfig.json
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts                 # Firebase client SDK init
│   │   ├── admin.ts                  # Firebase Admin SDK init
│   │   └── auth.ts                   # Auth helpers
│   ├── scoring/
│   │   ├── valueScore.ts             # Opportunity value algorithm
│   │   └── memberFitScore.ts         # Member-opportunity fit algorithm
│   └── utils/
│       ├── dates.ts
│       └── formatting.ts
│
├── hooks/
│   ├── useRealtimeData.ts            # Firestore real-time listeners
│   ├── useAuth.ts                    # Auth state management
│   ├── useRole.ts                    # Role-based access
│   └── useNotifications.ts          # In-app notification state
│
├── types/
│   ├── user.ts
│   ├── opportunity.ts
│   ├── squad.ts
│   ├── notification.ts
│   ├── vault.ts
│   └── analytics.ts
│
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
├── .firebaserc
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 15. SECURITY & PERFORMANCE ARCHITECTURE

### Security Layers

```
Layer 1: Firebase Authentication
  └── Google OAuth — domain-restricted to @srmist.edu.in
  └── Custom claims — role embedded in JWT token

Layer 2: Next.js Middleware
  └── Route-level protection based on role claim
  └── Unauthenticated users redirected to /login

Layer 3: Firestore Security Rules
  └── Collection-level read/write rules per role
  └── Field-level validation (no client can write agent-only fields)

Layer 4: Cloud Functions Authorization
  └── All onCall functions verify request.auth before executing
  └── Admin SDK operations only from server-side functions

Layer 5: API Key Management
  └── All third-party API keys stored as Firebase Secrets
  └── Never exposed to client-side code
  └── Rotated quarterly
```

### Performance Architecture

```
Client-Side Performance:
  └── Next.js App Router (React Server Components for static content)
  └── Firestore real-time listeners only on dashboard pages
  └── Framer Motion animations: lazy-loaded
  └── Recharts: dynamic import
  └── Target: FCP < 1.5s, LCP < 2.5s

Agent Performance:
  └── Scout Agent: lightweight scrapers, no AI at ingestion
  └── Analyzer Agent: Gemini 2.0 Flash (fast, cheap) for standard ops
  └── Gemini 1.5 Pro only for long documents (rulebooks, codebases)
  └── Cloud Tasks: parallel research agents prevent timeout
  └── Firestore compound indexes: all matchmaker queries < 200ms

Cost Optimization (Google Pro Tier):
  └── Gemini 2.0 Flash: 90% of AI calls (cheap)
  └── Gemini 1.5 Pro: 10% of AI calls (expensive, long-context only)
  └── Cloud Functions v2: minimum instances = 0 (no idle cost)
  └── Firestore: optimized queries prevent unnecessary reads
  └── Scout Agent: runs every 6h (not 1h) to balance freshness vs cost
```

---

## 16. SCALING ROADMAP (NTL → INDIA)

### V1 — NTL Only (Now)
- 1 organization, 50–100 members
- Hardcoded NTL lab structure
- Single Firebase project

### V2 — Multi-Lab NTL (After Internal Validation)
- Full V2 feature set (Section 12)
- Hardware inventory, Vault, Mock Judge
- All 5 notification channels

### V3 — Multi-Organization (Other SRM Clubs)
```
Architecture change required:
  └── Add 'organizationId' to all Firestore documents
  └── Firestore security rules enforce organization isolation
  └── Organization onboarding flow (admin creates org, configures labs)
  └── Pricing: Free for NTL (forever), ₹2,999/month per other club
  └── Separate Firebase project per org (data isolation) OR
      Multi-tenant single project with strict rules
```

### V4 — National Scale (University Tech Clubs Across India)
```
Infrastructure upgrade:
  └── Move from Firebase App Hosting → GKE (Kubernetes) if needed
  └── Firestore → multi-region replication (asia-south1 + asia-east1)
  └── Custom domain per organization (yourclub.ntlintelligence.in)
  └── White-label option (remove NTL branding, show club's own branding)
  └── Pricing model: SaaS subscription per organization
```

---

## 17. THE MAINTAINER PLAYBOOK

As the system architect who stays inside NTL, this is your operational checklist.

### Weekly (Every Monday)
- [ ] Check Firebase Console: Cloud Function error rates
- [ ] Review activity feed: any stuck opportunities (status = 'analyzed' for 48h+ without squad draft)
- [ ] Check token telemetry: weekly Gemini API spend within expected range
- [ ] Review dedup log: are any legitimate opportunities being marked duplicate?
- [ ] Check notification delivery receipts: any persistent channel failures

### Monthly
- [ ] Audit Firestore indexes: new query patterns may need new indexes
- [ ] Update scraper endpoints if MLH/Devpost APIs changed
- [ ] Re-calibrate value scoring weights based on which opportunities NTL won
- [ ] Rotate API keys that are 90+ days old

### Per Semester
- [ ] Run full member profile re-sync (GitHub profiles change)
- [ ] Update lab configuration if NTL's lab structure changed
- [ ] Archive old opportunities (status = completed, older than 6 months)
- [ ] Leaderboard reset or carry-forward decision with board leads

### When Something Breaks
```
Triage priority:
1. Auth broken → members can't log in → fix immediately
2. Dispatcher broken → notifications not sending → fix within 1 hour
3. Matchmaker broken → no squads being drafted → fix within 4 hours
4. Scout broken → no new opportunities → fix within 24 hours
5. UI bug → cosmetic, no data loss → fix within 48 hours
```

---

*End of Main Product Architecture Document.*

*V1 Build Timeline: 23 focused days.*
*V2 Build Timeline: 30–40 days after V1 validation.*

*Phase 0 (Days 1–3): Infrastructure · Phase 1 (Days 4–5): Profiles*
*Phase 2 (Days 6–8): Scout + Analyzer · Phase 3 (Days 9–10): Matchmaker*
*Phase 4 (Days 11–12): Dispatcher · Phase 5 (Day 13): Calendar Lock*
*Phase 6 (Days 14–16): War Room · Phase 7 (Days 17–18): Member Dashboard*
*Phase 8 (Day 19): Leaderboard · Phase 9 (Days 20–23): Polish + Deploy*

---

**Built for Next Tech Lab, SRM Kattankulathur.**
**Architect & Maintainer: Chaitanya Sangana.**
**Stack: Next.js 15 · Firebase Genkit · Gemini · Google Cloud Tasks · Resend · Twilio**

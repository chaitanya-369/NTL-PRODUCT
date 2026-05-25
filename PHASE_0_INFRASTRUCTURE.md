# NTL Intelligence Agent — Phase 0: Infrastructure Foundation

> **Mission Context:** This is the bedrock of the autonomous operating system for Next Tech Lab. Before the agents can hunt, match, and lock, the core infrastructure must be flawless. Phase 0 establishes the Firebase backend, the Next.js 15 frontend, the strict role-based access control (RBAC), and the design system.

**Duration:** Days 1–3  
**Goal:** Firebase project live, domain-restricted auth working, core database schemas and security rules deployed, and the cinematic NTL design system ready.

---

## BATCH 0.1 — FIREBASE & PROJECT SETUP
**Estimated Time:** 3 hours

The system requires a robust, globally accessible backend. We use Firebase for its real-time capabilities (crucial for the War Room dashboard), seamless Next.js App Hosting, and Cloud Functions v2 to run our AI agents.

### Task 0.1.1 — Create Firebase Project
- **Console:** Go to [console.firebase.google.com](https://console.firebase.google.com)
- **Action:** Create New Project named `ntl-intelligence-prod`
- **Analytics:** Enable Google Analytics (needed for token telemetry & usage tracking)
- **Region:** Set to `asia-south1` (Mumbai) for lowest latency for SRM Kattankulathur members
- **Billing:** Upgrade to **Blaze Plan** (Mandatory: Cloud Functions need external network access to hit third-party hackathon APIs and Gemini)

### Task 0.1.2 — Enable Firebase Services
In the Firebase Console, explicitly enable the following:
- **Authentication:** Enable Google Sign-In provider (we will restrict this to `@srmist.edu.in` and `@nexttechlab.in` via code).
- **Cloud Firestore:** Create the database in `asia-south1`. Start in production mode.
- **Cloud Storage:** Enable for `asia-south1` (will hold PDFs, resumes, pitch decks).
- **Cloud Functions:** Verify enabled (Node.js 20 environment).
- **App Hosting:** Enable Next.js native deployment integration.

### Task 0.1.3 — Initialize Local Project Workspace
Set up the CLI tools and link the local repo to the Firebase project.
```bash
npm install -g firebase-tools
firebase login
firebase init
```
*Selection Checklist during `firebase init`:*
- `Firestore`, `Functions`, `Storage`, `App Hosting`, `Emulators`
- Functions runtime: **Node.js 20** (TypeScript)
- Emulators to run locally: Auth, Firestore, Functions, Storage (ports default)

### Task 0.1.4 — Configure Google Cloud APIs (GCP)
Go to the [Google Cloud Console](https://console.cloud.google.com) for the `ntl-intelligence-prod` project:
- **Enable APIs:** 
  - Google Calendar API (for Agent 8: Calendar Locker)
  - Google People API
  - Cloud Tasks API (for Agent 5: Research Cluster parallel execution)
- **Service Account:** Create a Service Account for server-side operations (Agents).
- **Keys:** Download the Service Account JSON and store it securely as a Firebase Secret.

### Task 0.1.5 — Next.js 15 Project Initialization
Bootstrap the frontend application.
```bash
npx create-next-app@latest ntl-intelligence-app --typescript --tailwind --app --turbopack
cd ntl-intelligence-app
npm install firebase firebase-admin framer-motion lucide-react recharts clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button badge card dialog tooltip separator sheet dropdown-menu
```
*Note: Ensure Tailwind CSS is configured for v4 as per the master architecture.*

---

## BATCH 0.2 — AUTHENTICATION & ROLE SYSTEM
**Estimated Time:** 4 hours

NTL Intelligence is a private, role-aware system. Access is strictly gated. New users enter as `RECRUIT` and must be vetted before they can see the full system.

### Task 0.2.1 — Firebase Auth Configuration (Domain Restriction)
Only SRM students or NTL domain users can authenticate.
```typescript
// lib/firebase/auth.ts
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const ALLOWED_DOMAINS = ['srmist.edu.in', 'nexttechlab.in']

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ hd: ALLOWED_DOMAINS[0] })
  const result = await signInWithPopup(auth, provider)
  
  // Hard Validation
  const email = result.user.email ?? ''
  const domain = email.split('@')[1]
  if (!ALLOWED_DOMAINS.includes(domain)) {
    await signOut(auth)
    throw new Error('ACCESS_DENIED: NTL Board Clearance Required')
  }
  
  return result.user
}
```

### Task 0.2.2 — Role Assignment Cloud Functions
Implement Custom Claims to securely inject roles into the auth token.
```typescript
// functions/src/auth/onUserCreate.ts
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Fires when a new user signs in for the first time
export const onUserCreate = onDocumentCreated('users/{uid}', async (event) => {
  // Logic to initialize new user document with status: 'RECRUIT'
});

export const setUserRole = onCall(async (request) => {
  // Only board_lead or super_admin can call this
  const callerRole = request.auth?.token?.role;
  if (callerRole !== 'board_lead' && callerRole !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Unauthorized');
  }
  
  await admin.auth().setCustomUserClaims(request.data.uid, {
    role: request.data.role
  });
});
```

### Task 0.2.3 — Login Page UI (`/login`)
- Create `/app/(auth)/login/page.tsx`
- **Aesthetic:** Dark, cinematic, minimal. Terminal-style text elements.
- **Component:** GlowButton for "Sign in with Google".
- **Logic:** Redirect to `/onboarding` if they are a new user. If they have a role, redirect to `/dashboard` (or `/war-room` for board leads).

### Task 0.2.4 — Onboarding Flow (`/onboarding`)
- **Step 1: GitHub Integration:** Input GitHub URL. This sets up Phase 1 (Skill parsing).
- **Step 2: Notification Preferences:** Checkboxes for Discord and Email. Input fields for Discord Handle.
- **Step 3: Skill Confirmation:** Display AI-extracted skills for review.
- **Completion:** Sets `status: 'RECRUIT'` in Firestore and notifies `board_lead` for approval.

### Task 0.2.5 — Next.js Auth Middleware
Protect all routes using Next.js Middleware checking Firebase session cookies/tokens.
```typescript
// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session')?.value;
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Logic to decodeTokenRole(token)
  // Protect /war-room so only 'board_lead' and 'super_admin' can access
}
```

---

## BATCH 0.3 — FIRESTORE SETUP & SECURITY RULES
**Estimated Time:** 3 hours

The database schema must be secure on day one. Agents will read and write autonomously; humans should only read what they are permitted to, and write only to their own profiles or through specific Cloud Functions.

### Task 0.3.1 — Deploy Firestore Indexes
Deploy the compound indexes required by the dashboard and agent queries.
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
*Deploy via `firebase deploy --only firestore:indexes`*

### Task 0.3.2 — Deploy Security Rules
Implement the comprehensive RBAC matrix defined in the Master Architecture.
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSuperAdmin() { return request.auth.token.role == 'super_admin'; }
    function isBoardLead() { return request.auth.token.role == 'board_lead'; }
    function isLabLead() { return request.auth.token.role == 'lab_lead'; }
    function isActiveMember() { return request.auth.token.role in ['super_admin', 'board_lead', 'lab_lead', 'lab_member']; }

    match /users/{userId} {
      allow read: if request.auth.uid == userId || isLabLead() || isBoardLead() || isSuperAdmin();
      allow write: if request.auth.uid == userId || isSuperAdmin();
    }

    match /opportunities/{oppId} {
      allow read: if isActiveMember();
      allow write: if isSuperAdmin(); // Agents write via Admin SDK
    }
    
    // ... complete rules for squad_recommendations, analytics, etc.
  }
}
```

### Task 0.3.3 — Seed `system_config` Document
Create a script (or manual entry in console) to create the `system_config/global` document.
- `scoutCronInterval`: 6
- `activeScoutSources`: `['mlh', 'devpost', 'unstop', 'hackerearth']`
- `valueScoreThreshold`: `{ instant: 80, batched: 50 }`
- Define NTL Lab configurations (McCarthy, Norman, Tesla, Satoshi).

---

## BATCH 0.4 — DESIGN SYSTEM PRIMITIVES
**Estimated Time:** 2 hours

The system must look like a premium, state-of-the-art hacker OS. It should wow the board and the members instantly.

### Task 0.4.1 — CSS Variables & Tailwind Config
Set up the core color tokens in `globals.css` ensuring consistency with the NTL Intelligence landing page.
```css
/* globals.css */
:root {
  --color-bg: #030303;
  --color-surface: #0D0E12;
  --color-surface-2: #12141A;
  --color-border: #1F242E;
  --color-primary: #00FF66;       /* Available, success, CTA */
  --color-secondary: #00E5FF;     /* Agent activity, system */
  --color-danger: #FF3B3B;        /* Locked, danger, emergency */
  --color-warning: #FFB800;       /* Reviewing, pending */
  --color-text-primary: #F0F2F5;
  --color-text-secondary: #8F96A3;
}
```

### Task 0.4.2 — Build Core UI Components
Create the foundational reusable components inside `/components/ui`:
- `StatusBadge.tsx`: Pill indicating Available (Green), Reviewing (Yellow), Locked (Red).
- `GlowButton.tsx`: Primary CTA button with glowing hover effects.
- `TerminalText.tsx`: Monospace, typewriter-effect text for system logs.
- `RoleGate.tsx`: Wrapper component to hide/show children based on user role (e.g., `<RoleGate allowed={['board_lead']}>...</RoleGate>`).

---

### Verification for Phase 0
Before moving to Phase 1, verify:
1. Firebase project is live and you can deploy to App Hosting.
2. Logging in with a non-SRM email is strictly rejected.
3. Logging in with an SRM email creates a user document in the Firestore Emulator with `status: 'RECRUIT'`.
4. The dashboard layout renders the base CSS and custom tokens correctly.

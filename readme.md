# VES Campus Clash

**Github URL:** https://github.com/Raghav-Mundhara/VES-Campus-Clash
**Project URL:** d1ay330t1dxjec.cloudfront.net  

A campaign micro-app built for VES campuses: a QR-triggered game funnel ending in an Instagram Story Card. 

> **Deployment Note:** The backend is hosted on **AWS EC2**, and the frontend UI is hosted on **AWS CloudFront**.

---

## Technology Stack Used

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React (Vite) + TailwindCSS | Fast build, small bundle, easy responsive utility classes. Perfect for a "scan a QR → lands in mobile browser" experience. |
| **Backend** | Node.js + Express | Quick to stand up a small stateful API. |
| **Database/ORM** | PostgreSQL + Prisma | Schema-first, easy migrations. |
| **State/Session** | Server-issued tokens | Client-side state is easily bypassable; the state machine is strictly enforced server-side. |
| **Story Card** | `html2canvas` | Client-side rendering of the final downloadable Instagram Story Card. |
| **Deployment** | AWS EC2 & CloudFront | Backend running on EC2, and static React frontend served securely via CloudFront. |

---

## Folder Structure

```text
ves-campus-clash/
├── apps/
│   ├── web/                      # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/            # Landing, Register, Game, Result
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts        # Typed fetch wrappers
│   │   │   │   └── sessionGuard.tsx # Route-level state-machine guard
│   │   │   ├── index.css         # Global Tailwind styles
│   │   │   └── App.tsx           # App routing
│   │   └── vite.config.ts
│   └── api/                      # Express backend
│       ├── src/
│       │   ├── routes/           # follow, register, game, answer, session
│       │   ├── lib/              # shared logic (schema validations)
│       │   └── index.ts          # Express server entry point
│       └── prisma/
│           └── schema.prisma     # Database models
└── README.md
```

---

## Project Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database running locally or remotely

### 1. Database Setup
Ensure you have a PostgreSQL instance running. Update the `.env` file in the `apps/api` directory with your connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ves_campus_clash"
SESSION_SECRET="your_secret_here"
```

### 2. Backend Setup
```bash
cd apps/api
npm install
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
Ensure you have an `.env` (or `.env.development`) file in the `apps/web` directory with your backend API URL:
```env
VITE_API_URL="http://localhost:3001"
```

In a new terminal window:
```bash
cd apps/web
npm install
npm run dev
```
The frontend should now be running on `http://localhost:5173`.

---

## Assumptions Made

- **Math Puzzle Solver Mechanic:** 10 questions, 10 seconds each. Difficulty ramps up as the player progresses.
- **Server-Authoritative Timing:** The 10-second window is enforced server-side. The client-side countdown is purely for UX.
- **Instagram Follow Verification:** Not programmatically checked (as the Instagram API restricts third-party checks). It is implemented as a self-attestation gate, standard for such campaigns.
- **One Shot, One Score:** Enforced strictly by tracking session progression (`FOLLOWED` → `REGISTERED` → `PLAYING` → `COMPLETED`).
- **Story Card Generation:** Rendered as a fixed-template PNG using HTML-to-canvas rendering.

---

## Challenges Faced

- **Enforcing State Integrity:** Ensuring the "one shot, one score" rule strictly server-side while keeping game latency low on mobile networks.
- **Anti-Cheat:** Validating score submissions where the client cannot be trusted. Mitigated by generating questions on the fly, stamping `startedAt` server-side, and calculating the correctness and elapsed time entirely on the backend.
- **Timer Syncing:** Keeping the 10-second visual countdown in sync between client display and server's authoritative timestamp, compensating for network latency.
- **Story Card Rendering:** Ensuring the downloaded Instagram Story card renders perfectly, requiring careful adjustments to off-screen DOM positioning to prevent unwanted scrolling issues on the results page.

---

## Suggestions for Future Improvements

- **Real Instagram Verification:** Implement a more robust Graph API check if the campaign uses a Business account and warrants OAuth complexity.
- **Leaderboards:** Implement a global or per-institute leaderboard view to drive competitive engagement.
- **Adaptive Difficulty:** Rather than a fixed 3-tier difficulty table, dynamically adjust math puzzle difficulty based on the player's speed and accuracy.
- **Rate-Limiting & Bot Protection:** Add robust rate limiting (e.g. Redis) on registration and score submission endpoints to prevent automated spam.
- **Analytics Funnel:** Track drop-offs per step using the existing `Session.step` transitions to measure campaign effectiveness.

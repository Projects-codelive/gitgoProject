# GitGo — Launch your Open Source Career 🚀

> An AI-powered platform that helps developers discover, analyze, and contribute to open-source projects perfectly matched to their skills and experience.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🤖 AI Repo Recommendations | Personalized open-source matches based on your GitHub profile + resume |
| 🔬 Repository Analyzer | Deep architecture diagrams, tech-stack breakdown, and route analysis |
| 🗺️ GSoC Organizations | Browse all 185+ Google Summer of Code organizations with filters |
| 📊 Developer Dashboard | Overview of your GitHub stats, languages, and contributions |
| 🌐 Portfolio Generator | Auto-generate a public portfolio site from your GitHub data |
| 🏆 Community Feed | Share milestones, achievements, and posts with other developers |
| 🔭 Explore Repos | Browse curated contributor-friendly open-source repositories |
| 📈 Trending | Real-time GitHub trending repositories |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB (local) / DynamoDB (AWS) |
| Authentication | NextAuth.js v5 (GitHub OAuth) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Deployment | AWS Amplify / Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- GitHub OAuth App credentials
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/CURIOUSABHEE/gitgo.git
cd gitgo/source_code

# 2. Install dependencies
npm install

# 3. Copy env template
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

```bash
# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗺️ Dashboard Pages (UI Routes)

All dashboard pages are protected by GitHub OAuth. Users must be signed in to access them.

### `/dashboard` — Overview
**File:** `app/dashboard/overview/page.tsx`

The main landing page after login. Shows:
- Welcome banner with your GitHub avatar and name
- High-level stats: total repositories, stars, forks, languages detected
- Language breakdown badges
- Quick-access cards linking to each dashboard feature

---

### `/dashboard/recommendations` — AI Match Finder
**File:** `app/dashboard/recommendations/page.tsx`

AI-powered open-source repository recommendation engine.

**How it works:**
1. Fetches your GitHub repos, tech stack, and uploaded resume
2. Groq LLM analyzes your profile and identifies 3 tech domains you're strongest in
3. For each domain, it curates 10 real GitHub repositories perfectly matching your experience level
4. Results are organized by tech domain with personalized "Why it fits" and "Where to start" guidance

**Features:**
- **"Find My Matches"** — uses your connected GitHub profile
- **"Test with Any Profile"** — dev mode to test recommendations with any GitHub URL
- Stacked by experience level: `none → small → good → frequent`
- Phase stepper shows live LLM progress
- Regenerate button for different results

---

### `/dashboard/analyze` — Repository Analyzer
**File:** `app/dashboard/analyze/page.tsx`

Analyze any public GitHub repository using AI.

**What you get:**
- 📐 **Architecture Diagram** — interactive React Flow diagram of the codebase structure
- 🔬 **Tech Stack Breakdown** — frontend, backend, databases, external services detected from code
- 🗺️ **Route Map** — all API endpoints and pages listed with their purpose and lifecycle role
- Click any route to go to the Route Analyzer for a deep-dive execution trace

**Usage:** Paste any GitHub repo URL (e.g. `https://github.com/vercel/next.js`) and click Analyze.

---

### `/dashboard/analyze-route` — Route Execution Analyzer
**File:** `app/dashboard/analyze-route/page.tsx`

Deep-dives into a specific route's execution flow within an already-analyzed repository.

**What you get:**
- 🌊 **Flow Diagram** — visual diagram of which files, functions, and services are involved
- 📋 **Execution Trace** — step-by-step code walkthrough with:
  - Exact file + function location per step
  - Actual code snippet pulled from GitHub
  - Detailed explanation (5–7 sentences per step)
- Results are cached so subsequent loads are instant

**URL Parameters:** `?repoUrl=<repo>&route=<path>&routeIndex=<n>`

---

### `/dashboard/gsoc` — GSoC Organizations
**File:** `app/dashboard/gsoc/page.tsx`

Browse all 185 organizations that participated in **Google Summer of Code 2024**.

**Features:**
- Search by name, technology, or topic
- Filter by category (Science, Programming, Security, etc.)
- Sort by Name A–Z / Z–A or by number of topics
- Advanced filters: min/max topics, tech stack filter
- Mobile: card layout | Desktop: full table with all columns
- Links to org's official website and GSoC Ideas page

---

### `/dashboard/explore` — Explore Repositories
**File:** `app/dashboard/explore/page.tsx`

Browse a curated database of contributor-friendly open-source repositories synced from GitHub.

**Features:**
- Filter by language (JavaScript, TypeScript, Python, Rust, Go, Java)
- Full-text search across name, description, and topics
- Each card shows stars, "Good First Issues" count, and quality score
- Click any card to open a detailed modal with issue list
- Refresh button to pull latest from the database

---

### `/dashboard/trending` — Trending Repositories
**File:** `app/dashboard/trending/page.tsx`

Live GitHub trending repositories, auto-refreshed every 30 seconds.

**Features:**
- Shows repo name, owner, description, star count, and language badge
- Data sourced from GitHub scraper with caching
- Auto-retries on failure with real-time error alerts
- Responsive grid: 1-col mobile → 2-col tablet → 3-col desktop

---

### `/dashboard/projects` — My Projects
**File:** `app/dashboard/projects/page.tsx`

Your personal GitHub repository showcase pulled from your connected account.

**Features:**
- Profile card: avatar, bio, follower/following counts
- Stats cards: Total Repos, Stars, Forks, Languages
- Language badges detected from your repos
- Top 10 recent repositories shown as cards with:
  - Stars, forks, last updated date
  - **Read More** button → AI-powered repo deep-dive modal
  - **View** button → opens repo on GitHub

---

### `/dashboard/portfolio` — Portfolio Generator
**File:** `app/dashboard/portfolio/page.tsx`

Generate and publish a public portfolio website from your GitHub data.

**Features:**
- Choose a custom subdomain (`your-name.gitgo.dev`)
- Select which sections to display: About, Skills, Projects, Experience, Education, Contributions
- Choose from 4 templates: Minimal, Creative, Professional, Student
- Preview before publishing
- One-click **Publish** to make it live

---

### `/dashboard/community` — Community Feed
**File:** `app/dashboard/community/page.tsx`

Social feed for developers to share milestones and posts.

**Features:**
- Compose posts with optional tags
- Two post types: regular posts and milestone/achievement cards
- Like and comment on posts
- Feed refreshes after each interaction

---

### `/dashboard/settings` — Settings
**File:** `app/dashboard/settings/page.tsx`

Manage your account, integrations, and preferences. Organized into 7 tabs:

| Tab | Description |
|---|---|
| **Profile** | View your GitHub profile data |
| **Technology Map** | Tag the technologies you know |
| **Subscription** | View and upgrade your plan |
| **Integrations** | Connect GitHub, LinkedIn |
| **Resume** | Upload your resume PDF for AI analysis |
| **Preferences** | Theme and notification preferences |
| **Repository Database** | View and manage the synced repo database |

---

### `/dashboard/repo-sync` — Repository Sync Pipeline (Admin)
**File:** `app/dashboard/repo-sync/page.tsx`

Admin tool to manage the contributor-friendly repository database that powers the Explore page.

**Actions:**
- **Refresh** — reload current database stats
- **Sync GitHub** — pull new repositories from GitHub API into the database
- **Full Rebuild** — wipe and rebuild the database from scratch

---

## 🔌 API Routes

All API routes are under `/app/api/`. Auth-protected routes require an active GitHub OAuth session.

---

### `POST /api/analyze`
**File:** `app/api/analyze/route.ts`

Analyzes a public GitHub repository using Groq LLM.

**Request Body:**
```json
{ "repoUrl": "https://github.com/owner/repo", "forceRefresh": false }
```

**What it does:**
1. Fetches the repo's file tree, README, tech stack, and key file contents via GitHub API
2. Sends to Groq LLM for architecture analysis and route extraction
3. Caches the result in MongoDB for 7 days
4. Returns architecture diagram JSON, tech stack, and list of routes

**Response:**
```json
{ "data": { "architecture": {...}, "routes": [...], "techStack": {...} }, "cached": true }
```

---

### `GET /api/analyze-route`
**File:** `app/api/analyze-route/route.ts`

Deep-analyzes a specific route/endpoint within a previously analyzed repository.

**Query Params:** `?repoUrl=<url>&route=<path>&routeIndex=<n>&forceReload=<bool>`

**What it does:**
1. Checks subscription limit
2. Checks `RouteCache` MongoDB collection for a cached result
3. On cache miss: asks Groq to identify the relevant files for that route
4. Fetches those files from GitHub API
5. Asks Groq to trace the full execution flow with step-by-step code references
6. Saves to `RouteCache` for future instant retrieval

**Response:**
```json
{ "data": { "flowVisualization": "{...json...}", "executionTrace": "**Step 1...**" }, "fromCache": false }
```

---

### `POST /api/community/posts` — Create Post
### `GET /api/community/posts` — List Posts
**File:** `app/api/community/posts/route.ts`

Community feed CRUD. Supports post types: `post`, `milestone`, `achievement`.

---

### `GET /api/github/profile`
**File:** `app/api/github/profile/route.ts`

Fetches the authenticated user's GitHub profile: repos, languages, stats, followers.
Cached per-user in MongoDB with TTL.

---

### `GET /api/github/skills`
**File:** `app/api/github/skills/route.ts`

Infers a list of skills from the user's GitHub repos and languages.

---

### `GET /api/github/good-first-issues`
**File:** `app/api/github/good-first-issues/route.ts`

Searches GitHub for `good-first-issue` labeled issues matching specified languages/topics.

---

### `GET /api/github/technology-map`
**File:** `app/api/github/technology-map/route.ts`

Generates a technology map from the user's repositories and settings.

---

### `POST /api/github/sync`
**File:** `app/api/github/sync/route.ts`

Manually triggers a sync of the user's GitHub data into the database.

---

### `GET /api/github/repository/[id]`
**File:** `app/api/github/repository/[id]/route.ts`

Fetches detailed information for a single GitHub repository by its ID.

---

### `GET /api/gsoc/organizations`
**File:** `app/api/gsoc/organizations/route.ts`

Returns all 185 GSoC 2024 organizations. Data is cached in MongoDB for 6 months.

---

### `GET /api/repos/explore`
**File:** `app/api/repos/explore/route.ts`

Returns the curated contributor-friendly repos from the database.

**Query Params:** `?language=TypeScript&limit=50`

---

### `POST /api/repos/sync`
**File:** `app/api/repos/sync/route.ts`

Syncs contributor-friendly repositories from GitHub into the database. Used by the Repo Sync admin page.

---

### `GET /api/repos/analytics`
**File:** `app/api/repos/analytics/route.ts`

Returns analytics about the synced repository database (counts, languages, last sync time).

---

### `POST /api/repos/[repoUrl]/track`
**File:** `app/api/repos/[repoUrl]/track/route.ts`

Tracks when a user views or interacts with a repository card.

---

### `GET /api/repo-issues`
**File:** `app/api/repo-issues/route.ts`

Fetch open `good-first-issue` labeled issues for a specific repository.

**Query Params:** `?owner=<owner>&repo=<repo>`

---

### `POST /api/recommendations`
**File:** `app/api/recommendations/route.ts`

Generates AI-powered open-source repository recommendations. SSE (Server-Sent Events) stream for real-time progress.

**What it does:**
1. Fetches user's GitHub profile, skills, and resume from DB
2. Phase 1: Groq LLM analyzes developer profile and identifies 3 tech domains
3. Phase 2: LLM curates 10 repositories per domain from its internal knowledge
4. Phase 3: Validates and enriches each repo by fetching live data from GitHub API
5. Returns categorized recommendations with `whyItFits` and `whereToStart`

---

### `GET /api/trending`
**File:** `app/api/trending/route.ts`

Scrapes GitHub trending repositories. Returns cached data if available, otherwise fetches fresh.

---

### `GET /api/issues`
**File:** `app/api/issues/route.ts`

Fetches GitHub issues with filters for language, labels, and sort order.

---

### `GET /api/portfolio` — Get Portfolio
### `POST /api/portfolio` — Save Portfolio
**File:** `app/api/portfolio/route.ts`

Manages the user's portfolio configuration: username, template, sections, publish state.

---

### `POST /api/portfolio/generate`
**File:** `app/api/portfolio/generate/route.ts`

Generates the full portfolio HTML/data from the user's GitHub profile for preview and publishing.

---

### `GET /api/notifications`
**File:** `app/api/notifications/route.ts`

Returns user notifications (new issues, recommendation updates, community replies).

---

### `GET /api/subscription/status`
**File:** `app/api/subscription/status/route.ts`

Returns the user's current subscription plan and usage.

---

### `POST /api/subscription/check-limit`
**File:** `app/api/subscription/check-limit/route.ts`

Checks if the user has exceeded their plan's analysis limit. Used internally before LLM calls.

---

### `POST /api/subscription/upgrade`
**File:** `app/api/subscription/upgrade/route.ts`

Upgrades the user's plan.

---

### `GET /api/user/profile` — Get User Settings
### `PUT /api/user/profile` — Update User Settings
**File:** `app/api/user/profile/route.ts`

Read/write the user's stored profile settings, skills, location, and preferences.

---

### `POST /api/user/resume`
**File:** `app/api/user/resume/route.ts`

Accepts a resume PDF upload, parses it, and stores the extracted structured data (skills, experience, projects, education) in the user's profile for use in AI recommendations.

---

### `GET /api/user/preferences` — Get Preferences
### `PUT /api/user/preferences` — Update Preferences
**File:** `app/api/user/preferences/route.ts`

Stores user UI preferences (theme, notification settings, display options).

---

### `GET /api/user/linkedin`
**File:** `app/api/user/linkedin/route.ts`

Returns the user's linked LinkedIn profile status and data.

---

### `GET /api/linkedin/status`
### `POST /api/linkedin/connect`
### `POST /api/linkedin/sync`
**Files:** `app/api/linkedin/*/route.ts`

LinkedIn OAuth integration: check connection status, initiate OAuth, and sync LinkedIn profile data.

---

### `GET /api/github/discover-repos`
**File:** `app/api/github/discover-repos/route.ts`

Discovers contributor-friendly repositories from GitHub matching given language and topic filters. Used by the Repo Sync pipeline.

---

### `POST /api/cron/sync-repos`
**File:** `app/api/cron/sync-repos/route.ts`

Cron endpoint (protected by `CRON_SECRET`) that automatically syncs fresh repositories into the database on a schedule.

---

### `POST /api/cache/cleanup`
**File:** `app/api/cache/cleanup/route.ts`

Deletes expired cache entries from MongoDB (repo analyses older than 30 days, route caches older than 7 days).

---

## 🔑 Environment Variables

```env
# ── GitHub OAuth ──────────────────────────────
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_TOKEN=your_personal_access_token          # for GitHub API calls

# ── NextAuth ──────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_32_char_string

# ── Database ──────────────────────────────────
MONGODB_URI=mongodb+srv://...                    # MongoDB Atlas connection string

# ── Groq AI (Required) ────────────────────────
GROQ_API_KEY=gsk_...                             # Main key — used for all LLM calls

# ── Groq AI (Optional — improves rate limits) ─
GROQ_API_KEY_1=gsk_...                           # Route file-identification (index 0, 3, 6…)
GROQ_API_KEY_2=gsk_...                           # Route file-identification (index 1, 4, 7…)
GROQ_API_KEY_3=gsk_...                           # Route file-identification (index 2, 5, 8…)
GROQ_API_KEY_ARCHI_1=gsk_...                     # Architecture diagram generation
GROQ_API_KEY_ARCHI_2=gsk_...                     # Architecture diagram generation (load balanced)
GROQ_API_KEY_FOR_OPEN_SOUCE_FINDING_1=gsk_...   # Repo recommendations
GROQ_API_KEY_FOR_OPEN_SOUCE_FINDING_2=gsk_...   # Repo recommendations
GROQ_API_KEY_FOR_OPEN_SOUCE_FINDING_3=gsk_...   # Repo recommendations

# ── LinkedIn OAuth (Optional) ─────────────────
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# ── Cron (Optional) ───────────────────────────
CRON_SECRET=your_secret_for_cron_endpoints

# ── AWS (Only for AWS deployment) ─────────────
DATABASE_MODE=dynamodb                           # Set to "dynamodb" on AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

> **Note:** All `GROQ_API_KEY_*` variables are optional. If not set, the system automatically falls back to `GROQ_API_KEY` for all LLM calls.

---

## 📁 Project Structure

```
source_code/
├── app/
│   ├── api/                      # All API route handlers
│   │   ├── analyze/              # POST - Repo analysis
│   │   ├── analyze-route/        # GET  - Route execution analysis
│   │   ├── community/posts/      # GET/POST - Community feed
│   │   ├── github/               # GitHub data fetching
│   │   ├── gsoc/organizations/   # GET - GSoC orgs
│   │   ├── recommendations/      # POST - AI repo recommendations (SSE)
│   │   ├── repos/                # Explore, sync, analytics
│   │   ├── subscription/         # Plan management
│   │   ├── trending/             # GET - Trending repos
│   │   ├── user/                 # Profile, resume, preferences
│   │   └── portfolio/            # Portfolio CRUD + generate
│   ├── dashboard/                # All protected dashboard pages
│   │   ├── overview/             # Home dashboard
│   │   ├── analyze/              # Repo analyzer UI
│   │   ├── analyze-route/        # Route analyzer UI
│   │   ├── gsoc/                 # GSoC organizations browser
│   │   ├── explore/              # Explore repos UI
│   │   ├── trending/             # Trending repos
│   │   ├── recommendations/      # AI recommendations UI
│   │   ├── projects/             # My GitHub projects
│   │   ├── portfolio/            # Portfolio generator
│   │   ├── community/            # Community feed
│   │   ├── repo-sync/            # Admin: repo sync pipeline
│   │   └── settings/             # User settings (7 tabs)
│   ├── (auth)/                   # Login page
│   └── portfolio/                # Public portfolio viewer
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── dashboard/                # Dashboard-specific components
│   ├── community/                # Feed, post composer, milestone card
│   ├── settings/                 # Settings tab panels
│   └── landing/                  # Landing page components
├── lib/
│   ├── llm.ts                    # Groq LLM integration (all AI calls)
│   ├── github.ts                 # GitHub API helpers
│   ├── mongodb.ts                # MongoDB connection
│   ├── smart-cache.ts            # TTL caching layer
│   ├── request-deduplicator.ts   # Prevent duplicate concurrent LLM calls
│   └── utils.ts                  # Shared utilities
├── models/                       # Mongoose models (MongoDB schemas)
│   ├── RepositoryAnalysis.ts     # Cached repo analysis
│   ├── RouteCache.ts             # Cached route analysis
│   └── ...
├── hooks/
│   └── use-github.ts             # GitHub data React hook
└── types/                        # TypeScript type definitions
```

---

## 📜 Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Database
- [NextAuth.js](https://next-auth.js.org/) — Authentication

# SKILLGIT — план REST API

Документ составлен по текущим mock-данным (`frontend/src/data/`) и контекстам (`frontend/src/context/`).  
Цель: дать backend-команде контракт для поэтапной реализации и подключения фронтенда.

---

## Общие соглашения

| Параметр | Значение |
|----------|----------|
| Base URL | `https://api.skillgit.ru/v1` (dev: `http://localhost:3000/v1`) |
| Frontend env | `VITE_API_URL=/api` + Vite proxy на backend |
| Формат | JSON, UTF-8 |
| Даты | ISO 8601 (`2026-10-02T14:32:00Z`) — на фронте форматировать в «2 часа назад» |
| ID | UUID или bigint; в mock сейчас number/string |
| Пагинация | `?page=1&limit=20` → `{ data, meta: { page, limit, total } }` |
| Сортировка | `?sort=-createdAt` |
| Фильтры | query-параметры (`?status=active&direction=dev`) |

### Аутентификация

```
Authorization: Bearer <access_token>
```

| Endpoint | Описание |
|----------|----------|
| `POST /auth/register` | Регистрация студента |
| `POST /auth/login` | Email + password → tokens |
| `POST /auth/refresh` | Refresh token |
| `POST /auth/logout` | Invalidate session |
| `GET /auth/me` | Текущий пользователь (замена `CURRENT_USER`) |

**Роли:** `student` · `company_member` · `company_admin` · `platform_admin`

**Права:**
- `/company/*` — `company_member` + `company_admin` (scoped to company)
- `/admin/*` — `platform_admin`
- Публичные страницы — без auth

### Стандартные ошибки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [{ "field": "price", "message": "Must be >= 1000" }]
  }
}
```

| HTTP | code |
|------|------|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `RATE_LIMITED` |

---

## Фазы реализации

### Фаза 1 — MVP (2–3 недели)
Auth, Users, Tasks, Applications, Notifications, базовый Chat

### Фаза 2 — Маркетплейс (2–3 недели)
Balance, Payouts, My Tasks, Public profiles, Search

### Фаза 3 — Company CRM (2–3 недели)
Company admin: applicants, pipeline, deals, messages, billing

### Фаза 4 — LabSkill (4+ недели)
Repos, files, commits, issues, PRs, settings

### Фаза 5 — Platform Admin (2 недели)
Moderation, reports, transactions, analytics

### Фаза 6 — SkillMate / MateAI (отдельный сервис)
AI chats, projects, images, scheduled jobs, IDE downloads

---

## 1. Auth & Users

### User

```typescript
interface User {
  id: string;
  username: string;          // unique, slug
  name: string;
  email: string;
  role: 'student' | 'company_member' | 'company_admin' | 'platform_admin';
  direction: 'dev' | 'ai' | 'design' | 'qa' | 'security' | 'rpo';
  avatar: string | null;     // URL
  bio: string;
  skills: string[];
  location: string | null;
  website: string | null;
  company: string | null;    // display name
  joinedAt: string;
  stats: {
    tasksDone: number;
    balanceAmount: number;
    totalReceived: number;
    totalSpent: number;
    pendingAmount: number;
    rating: number;
    reviews: number;
  };
  followers: number;
  following: number;
  status: 'active' | 'blocked';
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/auth/me` | `CURRENT_USER`, `ProfilePage` |
| PATCH | `/users/me` | `SettingsPage`, `ProfilePage` |
| GET | `/users/:username` | `UserPublicPage` |
| GET | `/users/:username/reviews` | `ProfilePage` |
| POST | `/users/:username/follow` | Profile actions |
| DELETE | `/users/:username/follow` | Profile actions |

### Settings

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  locale: 'ru' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    taskUpdates: boolean;
    messages: boolean;
  };
  privacy: {
    showBalance: boolean;
    showEmail: boolean;
  };
}
```

| Method | Endpoint |
|--------|----------|
| GET | `/users/me/settings` |
| PATCH | `/users/me/settings` |

---

## 2. Tasks (маркетплейс)

### Task (каталог)

Источник: `TASKS` в `mockData.js`

```typescript
interface Task {
  id: string;
  companyId: string;
  company: string;           // denormalized
  companyColor: string;
  direction: string;
  badge: { text: string; kind: string } | null;
  verified: boolean;
  highPay: boolean;
  title: string;
  desc: string;              // short
  fullDesc: string;          // markdown
  tags: string[];
  price: number;             // kopecks or rubles (choose one, document)
  days: number;
  applicants: number;
  level: 'junior' | 'middle' | 'senior';
  postedAt: string;
  status: 'published' | 'draft' | 'paused' | 'closed';
  moderationStatus?: 'pending' | 'approved' | 'flagged';
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/tasks` | `HomePage`, `TaskCard` |
| GET | `/tasks/:id` | `TaskDetailPage` |
| GET | `/tasks?direction=dev&level=junior&search=python` | Filters on Home |
| POST | `/tasks/:id/apply` | Apply modal on `TaskDetailPage` |
| GET | `/tasks/:id/applicants` | Company view (count only for public) |

**Apply body:**
```json
{
  "cover": "Сопроводительное письмо",
  "labskillRepo": "ivan-ivanov/telegram-bot"
}
```

### My Task (engagement)

Источник: `MY_TASKS` в `mockData.js`

```typescript
interface MyTask {
  id: string;
  taskId: string;
  userId: string;
  company: string;
  companyColor: string;
  title: string;
  desc: string;
  tags: string[];
  status: 'applied' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priceLabel: string;
  deadline: string | null;
  progress: number;          // 0–100
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/my-tasks` | `TasksPage` |
| GET | `/my-tasks/:id` | Task detail in «Мои задачи» |
| PATCH | `/my-tasks/:id` | Progress updates |
| POST | `/my-tasks/:id/submit` | Submit for review |

### Directions (справочник)

| Method | Endpoint |
|--------|----------|
| GET | `/meta/directions` |

Response: `DIRECTIONS` from `mockData.js`

---

## 3. Notifications

Источник: `NOTIFICATIONS`, `NotificationsContext`

```typescript
interface Notification {
  id: string;
  type: 'response' | 'message' | 'payment' | 'task' | 'system';
  title: string;
  text: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/notifications` | `NotificationsContext`, `NotificationsPage` |
| POST | `/notifications/read` | `{ ids: string[] }` |
| POST | `/notifications/read-all` | Mark all read |

---

## 4. Chat

Источник: `CONVERSATIONS`, `MESSAGES`, `ChatPage`

### Conversation

```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'team' | 'task';
  name: string;
  avatar: string | null;
  avatarColor: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  members?: number;
  taskId?: string;
  pinned?: boolean;
}
```

### Message

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  attachments?: { type: string; url: string; name: string }[];
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/chat/conversations` | `ChatPage` sidebar |
| GET | `/chat/conversations/:id` | Conversation meta |
| GET | `/chat/conversations/:id/messages` | Message list |
| POST | `/chat/conversations/:id/messages` | Send message |
| POST | `/chat/conversations` | Create DM / team chat |

**Realtime (фаза 2+):** WebSocket `wss://api.skillgit.ru/v1/ws` — events: `message.new`, `typing`, `read`

---

## 5. Teams

Источник: `TEAMS`, `TeamPage`, `CreateTeamModal`

```typescript
interface Team {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string | null;
  members: { userId: string; role: 'owner' | 'admin' | 'member' }[];
  repos: string[];           // labskill repo refs
  createdAt: string;
}
```

| Method | Endpoint |
|--------|----------|
| GET | `/teams` |
| GET | `/teams/:slug` |
| POST | `/teams` |
| PATCH | `/teams/:slug` |
| POST | `/teams/:slug/members` |
| DELETE | `/teams/:slug/members/:userId` |

---

## 6. Balance & Payments

Источник: `BalanceContext`, `BALANCE_TRANSACTIONS`, `BalanceModal`

```typescript
interface Balance {
  amount: number;
  pendingAmount: number;
  currency: 'RUB';
}

interface BalanceTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 'task' | 'withdrawal' | 'fee' | 'bonus' | 'premium' | 'topup' | 'payout';
  title: string;
  amount: number;            // negative for expense
  createdAt: string;
  href: string | null;
  dealId?: string;
}

interface LinkedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'mir';
  last4: string;
  isDefault: boolean;
}

interface LinkedAccount {
  id: string;
  bankName: string;
  maskedNumber: string;
  isDefault: boolean;
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/balance` | `BalanceContext` |
| GET | `/balance/transactions` | Balance history |
| POST | `/balance/deposit` | `{ amount, method }` |
| POST | `/balance/withdraw` | `{ amount, payoutMethodId }` |
| GET | `/balance/cards` | Payment settings |
| POST | `/balance/cards` | Add card (tokenized via PSP) |
| DELETE | `/balance/cards/:id` | Remove card |
| GET | `/balance/accounts` | Bank accounts |
| POST | `/balance/accounts` | Add account |

> **Важно:** карты/счета не хранить raw — только токены платёжного провайдера (YooKassa, Stripe и т.д.)

---

## 7. Company (CRM)

Scope: все `/company/*` routes.  
Источник: `companyAdminData.js`, `CompanyAdminContext`

### Company

```typescript
interface Company {
  id: string;
  slug: string;
  name: string;
  color: string;
  industry: string;
  verified: boolean;
  plan: 'Free' | 'Business' | 'Enterprise';
  balance: number;
  email: string;
  website: string;
  description: string;
  joinedAt: string;
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/me` | `CompanyAdminLayout`, dashboard |
| PATCH | `/company/me` | `CompanySettingsPage` |
| GET | `/companies/:slug` | `CompanyPublicPage` (public) |

### Company Tasks

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/tasks` | `CompanyTasksPage` |
| POST | `/company/tasks` | `CompanyTaskNewPage` — `createTask()` |
| GET | `/company/tasks/:id` | `CompanyTaskDetailPage` |
| PATCH | `/company/tasks/:id` | `updateTask()` |
| POST | `/company/tasks/:id/publish` | `publishTask()` |
| POST | `/company/tasks/:id/pause` | `pauseTask()` |
| POST | `/company/tasks/:id/close` | `closeTask()` |

**Create task body** (from `CompanyAdminContext.createTask`):
```json
{
  "title": "string",
  "desc": "string",
  "fullDesc": "markdown",
  "direction": "dev",
  "price": 15000,
  "days": 5,
  "level": "junior",
  "tags": ["Python"],
  "status": "published | draft",
  "assigneeId": "uuid"
}
```

### Applicants (pipeline)

```typescript
interface Applicant {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  username: string;
  avatar: string;
  rating: number;
  skills: string[];
  status: 'new' | 'review' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedAt: string;
  cover: string;
  assigneeId: string | null;
  tags: string[];
  labskillRepo: string | null;
  interviewAt: string | null;
  source: 'SKILLGIT' | 'Referral';
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/applicants` | `CompanyApplicantsPage`, `CompanyPipelinePage` |
| GET | `/company/applicants/:id` | Applicant drawer |
| PATCH | `/company/applicants/:id/status` | `{ status }` |
| POST | `/company/applicants/:id/next` | Move pipeline forward |
| POST | `/company/applicants/:id/prev` | Move pipeline back |
| PATCH | `/company/applicants/:id/assign` | `{ assigneeId }` |
| GET | `/company/applicants/:id/notes` | CRM notes |
| POST | `/company/applicants/:id/notes` | `{ text }` |

### Deals

```typescript
interface Deal {
  id: string;
  applicantId: string | null;
  taskId: string | null;
  taskTitle: string;
  candidateName: string;
  username: string;
  amount: number;
  paid: number;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  deadline: string;
  milestone: string;
  createdAt: string;
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/deals` | `CompanyDealsPage` |
| POST | `/company/deals` | `createDealFromApplicant()` |
| POST | `/company/deals/:id/pay` | `{ amount }` — partial payout |
| PATCH | `/company/deals/:id` | Update milestone/progress |

### Company Messages

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/messages` | Thread list |
| GET | `/company/messages/:applicantId` | Thread messages |
| POST | `/company/messages/:applicantId` | Send `{ text }` |
| GET | `/company/message-templates` | `MESSAGE_TEMPLATES` |

### Company Team

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/team` | `CompanyTeamPage` |
| POST | `/company/team/invite` | `{ email, role, permissions }` |
| PATCH | `/company/team/:id` | Update role/permissions |
| DELETE | `/company/team/:id` | Remove member |

### Company Billing & Analytics

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/company/billing` | `CompanyBillingPage` |
| POST | `/company/billing/topup` | `{ amount }` |
| GET | `/company/analytics` | `CompanyAnalyticsPage` — trends |
| GET | `/company/activity` | `CompanyActivityPage` |

---

## 8. Platform Admin

Scope: `/admin/*`. Источник: `platformAdminData.js`, `PlatformAdminContext`

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/admin/stats` | `PlatformDashboardPage` |
| GET | `/admin/users` | `PlatformUsersPage` |
| GET | `/admin/users/:id` | `PlatformUserDetailPage` |
| PATCH | `/admin/users/:id` | `updateUser()` |
| POST | `/admin/users/:id/block` | `toggleUserBlock()` |
| POST | `/admin/users/:id/unblock` | Unblock |
| GET | `/admin/companies` | `PlatformCompaniesPage` |
| POST | `/admin/companies/:id/verify` | `verifyCompany()` |
| POST | `/admin/companies/:id/reject` | `rejectCompany()` |
| GET | `/admin/tasks` | `PlatformTasksPage` |
| POST | `/admin/tasks/:id/moderate` | `{ status: 'approved' \| 'flagged' \| 'rejected' }` |
| GET | `/admin/transactions` | `PlatformTransactionsPage` |
| POST | `/admin/transactions/:id/approve` | `approveTransaction()` |
| GET | `/admin/reports` | `PlatformReportsPage` |
| POST | `/admin/reports/:id/resolve` | `{ status }` |
| GET | `/admin/analytics` | `PlatformAnalyticsPage` |
| GET | `/admin/activity` | `PlatformActivityPage` |
| GET | `/admin/settings` | `PlatformSettingsPage` |
| PATCH | `/admin/settings` | `updateSettings()` |

**Platform settings** (`PLATFORM_SETTINGS_DEFAULT`):
```typescript
interface PlatformSettings {
  commissionRate: number;
  minTaskPrice: number;
  maxTaskPrice: number;
  autoVerifyCompanies: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  autoBlockSpam: boolean;
  requireCompanyKyc: boolean;
}
```

---

## 9. LabSkill (Git-hosting)

Источник: `LabSkillReposContext`, `mockData.LABSKILL_*`, `repoTabData.js`

Самый тяжёлый модуль. Рекомендуется отдельный `labskill-service` или интеграция с Gitea/GitLab API.

### Repository

```typescript
interface Repository {
  id: string;
  owner: string;             // username
  name: string;
  fullName: string;          // owner/name
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  visibility: 'public' | 'private';
  pinned: boolean;
  topics: string[];
  taskId: string | null;
  source: 'task' | 'pet';
  company: string | null;
  verified: boolean;
  defaultBranch: string;
  updatedAt: string;
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/labskill/repos` | `LabSkillPage`, `api.getLabSkillRepos` |
| GET | `/labskill/repos/:owner/:name` | `LabSkillRepoPage` |
| POST | `/labskill/repos` | `LabSkillNewRepoPage` — `createRepo()` |
| PATCH | `/labskill/repos/:owner/:name` | `updateRepo()` |
| DELETE | `/labskill/repos/:owner/:name` | `deleteRepo()` |
| GET | `/labskill/explore` | Explore tab |
| GET | `/labskill/starred` | Starred repos |
| POST | `/labskill/repos/:owner/:name/star` | Star |
| DELETE | `/labskill/repos/:owner/:name/star` | Unstar |
| POST | `/labskill/repos/:owner/:name/clone-event` | Analytics |

### Files & Commits

```typescript
interface RepoFile {
  path: string;
  content: string;
  size: number;
  language: string;
}

interface Commit {
  id: string;
  sha: string;
  message: string;
  author: string;
  authorId: string;
  createdAt: string;
  changes: { path: string; action: 'add' | 'modify' | 'delete' }[];
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/labskill/repos/:owner/:name/tree` | File tree |
| GET | `/labskill/repos/:owner/:name/blob/*path` | File content |
| POST | `/labskill/repos/:owner/:name/files` | Upload — `addFilesToRepo()` |
| GET | `/labskill/repos/:owner/:name/commits` | Commit history |
| GET | `/labskill/repos/:owner/:name/commits/:sha` | `RepoCommitDetail` |
| POST | `/labskill/repos/:owner/:name/commits` | Create commit |

### Issues & Pull Requests

Источник: `repoTabData.js`

| Method | Endpoint |
|--------|----------|
| GET | `/labskill/repos/:owner/:name/issues` |
| POST | `/labskill/repos/:owner/:name/issues` |
| GET | `/labskill/repos/:owner/:name/issues/:number` |
| GET | `/labskill/repos/:owner/:name/pulls` |
| POST | `/labskill/repos/:owner/:name/pulls` |
| GET | `/labskill/repos/:owner/:name/pulls/:number` |
| POST | `/labskill/repos/:owner/:name/pulls/:number/merge` |

### Branches, Tags, Actions, Insights

| Method | Endpoint | Tab |
|--------|----------|-----|
| GET/POST | `/labskill/repos/:owner/:name/branches` | Branches |
| GET/POST | `/labskill/repos/:owner/:name/tags` | Tags |
| GET | `/labskill/repos/:owner/:name/actions` | Actions |
| GET | `/labskill/repos/:owner/:name/insights` | Insights |
| GET/PATCH | `/labskill/repos/:owner/:name/settings` | Settings |

### Repo Settings

Источник: `repoSettingsModel.js`, `RepoSettingsTab`

```typescript
interface RepoSettings {
  general: { name, description, visibility, defaultBranch };
  branches: { protectionRules: BranchRule[] };
  collaborators: { userId, permission }[];
  webhooks: Webhook[];
  pages: { enabled, branch, path };
}
```

---

## 10. SkillMate (AI Web)

Отдельный AI-сервис. Источник: `SkillMatePage`, `skillMateSectionsData.js`

### Chat

```typescript
interface SkillMateChat {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  unread: number;
  pinned: boolean;
  projectId: string | null;
  mode: 'chat' | 'work';
  model: string;
}

interface SkillMateMessage {
  id: string;
  chatId: string;
  role: 'user' | 'agent';
  text: string;
  createdAt: string;
  attachments?: Attachment[];
}
```

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/skillmate/chats` | Sidebar chat list |
| POST | `/skillmate/chats` | New chat |
| GET | `/skillmate/chats/:id/messages` | Chat thread |
| POST | `/skillmate/chats/:id/messages` | Send (SSE stream) |
| PATCH | `/skillmate/chats/:id` | Rename, pin |
| DELETE | `/skillmate/chats/:id` | Delete chat |

**Streaming:** `POST /skillmate/chats/:id/messages` → `Content-Type: text/event-stream`

### Projects

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/skillmate/projects` | `SkillMateProjectsPage` |
| POST | `/skillmate/projects` | Create project modal |
| GET | `/skillmate/projects/:id` | Project detail |
| PATCH | `/skillmate/projects/:id` | Update memory/settings |

### Images, Library, Scheduled, Plugins

| Method | Endpoint | Data source |
|--------|----------|-------------|
| GET | `/skillmate/images` | `SKILLMATE_IMAGES` |
| POST | `/skillmate/images/generate` | `{ prompt, templateId? }` |
| GET | `/skillmate/library` | `SKILLMATE_LIBRARY_ITEMS` |
| POST | `/skillmate/library/upload` | multipart |
| GET | `/skillmate/scheduled` | `SKILLMATE_SCHEDULED` |
| POST | `/skillmate/scheduled` | Create job |
| GET | `/skillmate/plugins` | `skillMatePluginsData.js` |
| POST | `/skillmate/plugins/:id/install` | Enable plugin |

### Models meta

| Method | Endpoint |
|--------|----------|
| GET | `/skillmate/models` | GPT-4o, Claude, Mate Pro |

---

## 11. MateAI (Desktop IDE)

Landing: `MateAIPage.jsx` — отдельный продукт.

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/mateai/releases/latest` | Latest version info |
| GET | `/mateai/releases/:version/download` | Signed download URL |
| GET | `/mateai/releases` | All platforms |
| POST | `/mateai/license/activate` | License key (optional) |

```typescript
interface MateAIRelease {
  version: string;           // "1.2.0"
  publishedAt: string;
  platforms: {
    windows: { url: string; sha256: string; size: number };
    macos: { url: string; sha256: string; size: number; arch: 'universal' };
    linux: { deb: string; appimage: string; sha256: string };
  };
  releaseNotes: string;      // markdown
}
```

---

## 12. Search & Meta

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | `/search?q=telegram&type=tasks\|users\|repos` | `GhGlobalSearch` |
| GET | `/meta/directions` | Directions list |
| GET | `/health` | Health check |

---

## Маппинг: frontend → API

| Frontend файл | Заменить на |
|---------------|-------------|
| `data/mockData.js` → `TASKS`, `CURRENT_USER` | `/tasks`, `/auth/me` |
| `data/mockData.js` → `MY_TASKS` | `/my-tasks` |
| `data/mockData.js` → `CONVERSATIONS`, `MESSAGES` | `/chat/*` |
| `data/mockData.js` → `NOTIFICATIONS` | `/notifications` |
| `data/mockData.js` → `LABSKILL_*` | `/labskill/*` |
| `data/mockData.js` → `BALANCE_*` | `/balance/*` |
| `context/CompanyAdminContext.jsx` | `/company/*` |
| `context/PlatformAdminContext.jsx` | `/admin/*` |
| `context/LabSkillReposContext.jsx` | `/labskill/repos/*` |
| `context/NotificationsContext.jsx` | `/notifications` |
| `context/BalanceContext.jsx` | `/balance/*` |
| `SkillMatePage.jsx` (local state) | `/skillmate/*` |
| `services/api.js` | Расширить всеми endpoint'ами выше |

---

## Рекомендуемый стек backend

| Слой | Вариант |
|------|---------|
| API | Node.js (Fastify/Nest) или Python (FastAPI) |
| DB | PostgreSQL (main) + Redis (sessions, cache) |
| Files | S3-compatible (LabSkill blobs, SkillMate library) |
| Search | PostgreSQL FTS → Elasticsearch при росте |
| Queue | Redis/BullMQ (notifications, AI jobs, webhooks) |
| AI | OpenAI/Anthropic proxy в `skillmate-service` |
| Git | Gitea API или bare git + go-git |

---

## Следующие шаги

1. **Backend:** создать `backend/` с OpenAPI spec (можно сгенерировать из этого документа)
2. **Frontend:** добавить `.env.example`, Vite proxy, подключить `api.js` в контексты
3. **Auth:** реализовать `AuthProvider` + protected routes
4. **Фаза 1:** `auth` + `tasks` + `applications` + `notifications`
5. **CI:** contract tests — frontend mock responses = backend fixtures

---

*Документ актуален на основе frontend mock от октября 2026.*

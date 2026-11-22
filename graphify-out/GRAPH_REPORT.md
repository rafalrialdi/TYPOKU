# Graph Report - typoku  (2026-11-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 577 nodes · 1341 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.84)
- Token cost: 2,932 input · 167 output

## Graph Freshness
- Built from commit: `eb5af4c4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Components and Hooks
- React Application Core
- Database and Auth Utilities
- Backend Controllers and Middleware
- Frontend Core Dependencies
- Backend Dependencies
- Authentication and API Client
- Gemini AI Integration
- Project Core and Infrastructure
- Navigation and Layout Components
- Docker and Environment Configuration
- Email Notification Service
- Vercel Deployment Configuration
- Order and Payment Hooks

## God Nodes (most connected - your core abstractions)
1. `api()` - 37 edges
2. `App()` - 31 edges
3. `sendError()` - 29 edges
4. `sendSuccess()` - 23 edges
5. `react-router-dom` - 22 edges
6. `CekTypo()` - 21 edges
7. `react` - 21 edges
8. `react-icons` - 20 edges
9. `Parafrase()` - 18 edges
10. `Checkout()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `TypoKu Brand Logo (500x500 traced vector, light background, purple wordmark)` --conceptually_related_to--> `TypoKu — AI Academic Writing Assistant`  [INFERRED]
  frontend/public/logo.svg → readme.md
- `TypoKu Favicon (500x500 traced vector, same artwork as brand logo)` --conceptually_related_to--> `TypoKu — AI Academic Writing Assistant`  [INFERRED]
  frontend/src/assets/icon-favicon.svg → readme.md
- `React + Vite Minimal Template` --conceptually_related_to--> `React 19 + Vite Frontend Stack`  [INFERRED]
  frontend/README.md → readme.md
- `Checkout()` --indirect_call--> `getPaymentStatus()`  [INFERRED]
  frontend/src/pages/Checkout.jsx → frontend/src/services/paymentApi.js
- `Frontend HTML Entry Document (title Typoku)` --references--> `TypoKu Favicon (500x500 traced vector, same artwork as brand logo)`  [EXTRACTED]
  frontend/index.html → frontend/src/assets/icon-favicon.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Frontend Application Shell and Branding Assets** — frontend_index_html, frontend_index_main_jsx, frontend_index_root_mount, frontend_public_logo_typoku, frontend_src_assets_icon_favicon_typoku_favicon [INFERRED 0.75]
- **Gemini-powered Academic Writing Features** — readme_cek_typo, readme_parafrase, readme_terjemah, readme_gemini_api, readme_gemini_model_fallback [INFERRED 0.85]

## Communities (14 total, 1 thin omitted)

### Community 0 - "UI Components and Hooks"
Cohesion: 0.09
Nodes (28): Skeleton(), Toast(), useToast(), useAuth(), useMyAccess(), ALLOWED_EXTENSIONS, CekTypo(), handleClearFile() (+20 more)

### Community 1 - "React Application Core"
Cohesion: 0.05
Nodes (53): App(), RequireAuth(), RootErrorBoundary(), RouteWithQueryBoundary(), ScrollToTop(), AuthHeader(), ErrorBoundary, hasArrayChanged() (+45 more)

### Community 2 - "Database and Auth Utilities"
Cohesion: 0.07
Nodes (48): buildSslConfig(), fs, isTruthy(), mysql, path, pool, bcrypt, login() (+40 more)

### Community 3 - "Backend Controllers and Middleware"
Cohesion: 0.06
Nodes (45): parafrase(), cron, initExpireSubscriptionJob(), authenticate(), authLimiter, forgotPasswordLimiter, generalLimiter, orderLimiter (+37 more)

### Community 4 - "Frontend Core Dependencies"
Cohesion: 0.06
Nodes (46): dependencies, @hookform/resolvers@^7.0.3, react@^19.3.1, react-dom@^19.3.1, react-hook-form@^7.91.0, react-icons@^5.7.0, @react-oauth/google@^0.13.5, react-router-dom@^7.18.4 (+38 more)

### Community 5 - "Backend Dependencies"
Cohesion: 0.06
Nodes (46): dependencies, bcryptjs@^3.0.3, cors@^2.8.6, dotenv@^18.0.9, express-rate-limit@^8.7.2, @google/genai@^2.31.0, helmet@^8.3.0, jsonwebtoken@^9.0.3 (+38 more)

### Community 6 - "Authentication and API Client"
Cohesion: 0.15
Nodes (25): AuthContext, AuthProvider(), handleAuthChanged(), useGoogleLoginMutation(), useLoginMutation(), useRegisterMutation(), clearPersistedCache(), API_BASE_URL (+17 more)

### Community 7 - "Gemini AI Integration"
Cohesion: 0.08
Nodes (43): cooldownMsFor(), generateStructuredContent(), getClient(), getErrorCode(), { GoogleGenAI }, isModelCoolingDown(), isQuotaError(), isRetryable() (+35 more)

### Community 8 - "Project Core and Infrastructure"
Cohesion: 0.08
Nodes (26): Frontend HTML Entry Document (title Typoku), src/main.jsx Module Entry Script, #root React Mount Point, TypoKu Brand Logo (500x500 traced vector, light background, purple wordmark), ESLint Configuration Expansion (TypeScript + typescript-eslint recommendation), React + Vite Minimal Template, TypoKu Favicon (500x500 traced vector, same artwork as brand logo), Cek Typo Feature (spelling/typo detection with PDF/DOCX/TXT upload) (+18 more)

### Community 9 - "Navigation and Layout Components"
Cohesion: 0.11
Nodes (20): Footer(), FooterLink(), produk, socials, sumberDaya, getInitials(), Navbar(), addDays() (+12 more)

### Community 10 - "Docker and Environment Configuration"
Cohesion: 0.08
Nodes (25): VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID, build, condition, container_name, env_file, healthcheck, ports (+17 more)

### Community 11 - "Email Notification Service"
Cohesion: 0.27
Nodes (9): brevoApiKey, buildResetEmailHtml(), mailFromEmail, mailFromName, nodemailer, sendPasswordResetEmail(), sendViaBrevo(), sendViaSmtp() (+1 more)

### Community 13 - "Order and Payment Hooks"
Cohesion: 0.14
Nodes (28): useCreateOrder(), usePackages(), usePaymentConfig(), usePaymentPolling(), usePaymentStatus(), api(), queryKeys, Checkout() (+20 more)

## Knowledge Gaps
- **3 isolated node(s):** `ESLint Configuration Expansion (TypeScript + typescript-eslint recommendation)`, `Google Identity Services Login`, `Midtrans Notification Webhook with SHA-512 Signature Verification`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 169 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `React Application Core` to `UI Components and Hooks`, `Navigation and Layout Components`, `Frontend Core Dependencies`, `Order and Payment Hooks`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `ESLint Configuration Expansion (TypeScript + typescript-eslint recommendation)`, `Google Identity Services Login`, `Midtrans Notification Webhook with SHA-512 Signature Verification` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components and Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.09397163120567376 - nodes in this community are weakly interconnected._
- **Why does `react` connect `React Application Core` to `UI Components and Hooks`, `Frontend Core Dependencies`, `Authentication and API Client`, `Navigation and Layout Components`, `Order and Payment Hooks`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `React Application Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05362517099863201 - nodes in this community are weakly interconnected._
- **Why does `api()` connect `Order and Payment Hooks` to `UI Components and Hooks`, `React Application Core`, `Authentication and API Client`, `Navigation and Layout Components`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `Database and Auth Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
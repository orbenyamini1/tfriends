# 🎯 tfriends - Group Activity Matching Platform

**tfriends** is an interactive, full-stack MERN application engineered to eliminate decision fatigue and group disagreements when deciding "What are we doing today?". 
Inspired by swipe-matching mechanics, it enables group members to browse activity proposals, register preferences via dynamic card swiping, and trigger real-time group matches when at least two members share an interest.

---

## 🌐 Live Deployments
- **Frontend (Vercel):** [https://tfriends.vercel.app/]
- **Backend API (Render):** https://tfriends-backend.onrender.com
- **Monorepo Repository:** https://github.com/orbenyamini1/tfriends

---

## 👥 Team & Responsibilities
- **Or Benyamini** – Full Stack Developer & System Architect
  - Designed the end-to-end RESTful architecture, MVC backend services, and cloud deployment pipelines.
  - Implemented client-side state management combining Context API and Redux Toolkit.
  - Enforced security protocols (JWT, bcrypt, Helmet headers, two-tiered rate limiting) and optimized React rendering pipelines.

---

## 🛠 System Architecture & Tech Stack

### Backend (Node.js & Express)
- **Architecture:** Structured Model-View-Controller (MVC) separating controllers, routes, models, config, and middleware layers.
- **Database Layer:** Cloud-hosted MongoDB Atlas managed via Mongoose ODM schemas with strong typing, cross-collection references, and complex query operators (`$in`, `$nin`, `populate`).
- **Security & Protection:**
  - `bcrypt`: Password salting and hashing (pre-save workflow).
  - `jsonwebtoken` (JWT): Stateless authentication issued on login and verified via a centralized `protect` middleware.
  - `helmet`: Hardened HTTP response headers (configured to prevent cross-origin embedding conflicts and CSP script evaluation blocks).
  - `express-rate-limit`: Two-tiered protection preventing Denial of Service (DoS) and brute-force authentication attacks on login/register endpoints.
- **Validation & Media Processing:**
  - `Joi`: Strict schema validation middleware intercepting bad payloads prior to controller execution.
  - `Multer`: Multi-part form data processing for avatar and group image uploads, stored under static asset directories.
  - **Global Error Handling:** Centralized 4-parameter error middleware standardizing JSON response formats.

### Frontend (React SPA with Vite)
- **Tooling:** Vite build system delivering fast compilation, native ES modules, and modern React 18+ pipelines.
- **State Management Architecture:**
  - **Context API (`AuthContext`):** Manages global session state, JWT persistence, local storage sync, and auto-login handshake (`/api/auth/me`).
  - **Redux Toolkit (`store.js`, `groupSlice.js`):** Coordinates domain-level state, asynchronous fetching (`createAsyncThunk`), active group switching, local swipe history, and real-time match events.
- **Performance & Optimization:**
  - `React.lazy` & `Suspense`: Route-level code splitting minimizing initial bundle footprint.
  - `React.memo`: Memoized `ActivityCard` components preventing unnecessary re-renders during rapid swiping.
- **Routing & Fallbacks:**
  - React Router DOM v6 with `PrivateRoute` wrappers protecting authenticated views.
  - Dedicated Catch-All 404 Route (`path="*"`) with customized UI.
  - `vercel.json` rewrite configuration preventing 404 routing errors on direct URL refreshes.

---

## 🗄 Database Design & Schema Relationships (MongoDB)
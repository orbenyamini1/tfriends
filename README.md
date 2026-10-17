# 🎯 tfriends - Group Activity Matching Platform

**tfriends** is a full-stack MERN platform designed to resolve group indecision when choosing activities. Group members swipe through curated leisure options, triggering automatic group matches whenever at least two members like the same activity.

---

## 🌐 Live Deployments & Repository
- **Frontend (Vercel):** https://tfriends.vercel.app
- **Backend API (Render):** https://tfriends-backend.onrender.com
- **GitHub Monorepo:** https://github.com/orbenyamini1/tfriends

---

## 👥 Contributor & Role
- **Or Benyamini** – Full Stack Developer
  - Designed the end-to-end MVC architecture and integrated MongoDB Atlas collections.
  - Implemented client state using Context API and Redux Toolkit.
  - Hardened endpoints with JWT, bcrypt, Helmet headers, and express-rate-limit.
  - Configured SPA routing fallbacks (`vercel.json`) and optimized React renders with `React.lazy` and `React.memo`.

---

## 🛠 Tech Stack & Architecture

- **Backend:** Node.js, Express (MVC), Mongoose, MongoDB Atlas.
- **Frontend:** React 18, Vite, React Router DOM v6, Redux Toolkit, Context API.
- **Security:** Helmet (CORP-enabled), express-rate-limit (API & Auth limits), JWT stateless tokens, bcrypt password hashing.
- **Media & Validation:** Multer (multipart uploads), Joi (request schema validation).
- **Optimization:** Route-level Code Splitting (`Suspense` + `lazy`), `React.memo` activity cards.

---

## 🗄 Database Design (MongoDB Mongoose Schemas)

┌──────────────┐             ┌──────────────┐
│     User     │◄────────────┤    Group     │
│--------------│ admin (ref) │--------------│
│ _id          │             │ _id          │
│ name         │◄────────────┤ name         │
│ email        │ members[]   │ code         │
│ passwordHash │ (refs)      │ image        │
│ preferences  │             └──────────────┘
└──────┬───────┘                    ▲
│                            │
│ user (ref)                 │ Target group
▼                            │
┌──────────────┐                    │
│    Swipe     ├────────────────────┘
│--------------│
│ _id          │
│ user (ref)   │             ┌──────────────┐
│ activity(ref)├────────────►│   Activity   │
│ status       │             │--------------│
└──────────────┘             │ _id          │
│ title        │
│ category     │
│ image / url  │
└──────────────┘

1. **User:** Stores authentication details (`password` excluded via `select: false`), avatar filename, and category interests.
2. **Group:** Manages groups with auto-generated unique codes, an `admin` user reference, and a `members` reference array.
3. **Activity:** Pre-seeded activity options categorized by leisure type with local and remote image paths.
4. **Swipe:** Join collection storing user decisions (`like`/`dislike`) linking `user` and `activity` IDs.

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and issue JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile from token | Bearer Token |
| `PUT` | `/api/auth/profile` | Update profile information and avatar | Bearer Token |
| `GET` | `/api/groups` | Get all groups current user belongs to | Bearer Token |
| `POST` | `/api/groups` | Create group and upload thumbnail | Bearer Token |
| `POST` | `/api/groups/join` | Join group via invite code | Bearer Token |
| `DELETE`| `/api/groups/:groupId/members/:memberId` | Remove member from group (Admin only) | Bearer Token (Admin) |
| `GET` | `/api/groups/:groupId/matches` | Fetch retroactive and live matches (>= 2 likes) | Bearer Token |
| `GET` | `/api/activities` | Fetch unswiped activities (`$nin` filter) | Bearer Token |
| `POST` | `/api/activities` | Create activity card (Joi validation) | Bearer Token |
| `GET` | `/api/swipes` | Retrieve logged user swipe history | Bearer Token |
| `POST` | `/api/swipes` | Submit swipe and trigger group match logic | Bearer Token |
| `GET` | `/api/health` | Diagnostic server health check | Public |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tfriends?retryWrites=true&w=majority
JWT_SECRET=your_secret_jwt_key
CLIENT_URL=http://localhost:5173


💻 Local Setup Instructions

# 1. Clone repository
git clone [https://github.com/orbenyamini1/tfriends.git](https://github.com/orbenyamini1/tfriends.git)
cd tfriends

# 2. Run Backend
cd backend
npm install
npm run dev

# 3. Run Frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
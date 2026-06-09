# 🐰 Rabbit

> Anonymous Reddit-style community platform designed exclusively for college students.

Rabbit allows users to share thoughts, ask questions, and engage in discussions **without revealing their identity**, creating a space for open and honest communication within the campus.

---

## 📁 Project Structure

```
Rabbit/
├── backend/    ← Node.js + Express + MongoDB API  (Nikhil)
└── frontend/   ← UI/UX (Prateeksha)
```

---

## 🔑 Features

- ✅ **Anonymous Posting** — Random identity like "Curious Rabbit #4521"
- ✅ **Upvote / Downvote** — Best posts rise to the top (Reddit-style)
- ✅ **Nested Comments** — Threaded discussion replies
- ✅ **Communities** — Campus Confessions, Ask Seniors, Lost & Found, Study Materials, Marketplace, Events
- ✅ **Search** — Find questions and discussions
- ✅ **Safety (Core)** — College email verification, JWT Auth
- ✅ **College Silos** — Strict database isolation so users only see content from their own college network
- ✅ **Rabbit Karma** — Earn points from upvotes
- ✅ **Achievement Badges** — Helpful Senior, Top Contributor, Placement Guru
- ✅ **Trending** — Reddit-style decay algorithm
- ✅ **Polls** — Vote on campus decisions
- ✅ **Event Hub** — College clubs announce events, RSVP, capacity control
- ✅ **Safety (Advanced)** — Report system, admin panel, ban/unban users, admin content deletion

---

## 🚀 Getting Started (Backend)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Gmail App Password for email OTP

### Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env

npm install
npm run dev
```

Server starts at: `http://localhost:5001`

### Health Check
```
GET http://localhost:5001/api/health
```

---

## 📡 API Overview

| Module | Base Route | Auth Required |
|---|---|---|
| Auth | `/api/auth` | Partial |
| Communities | `/api/communities` | ✅ |
| Posts | `/api/posts` | ✅ |
| Comments | `/api/comments` | ✅ |
| Search | `/api/search` | ✅ |
| **Events** | **`/api/events`** | ✅ |
| **Reports / Admin** | **`/api/reports`** | ✅ (Admin for some) |

### 🎉 Event Hub — `/api/events`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List events (`?filter=upcoming\|past\|all&tag=tech`) |
| `POST` | `/api/events` | Create event |
| `GET` | `/api/events/:id` | Get single event |
| `POST` | `/api/events/:id/rsvp` | RSVP / un-RSVP |
| `PATCH` | `/api/events/:id/cancel` | Cancel event (organizer or admin) |
| `GET` | `/api/events/community/:communityId` | Events by community |

### 🛡️ Safety / Admin — `/api/reports`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reports` | User | Submit a report |
| `GET` | `/api/reports` | Admin | List reports (`?status=pending&targetType=post`) |
| `PATCH` | `/api/reports/:id` | Admin | Update report status |
| `GET` | `/api/reports/admin/stats` | Admin | Dashboard stats |
| `PATCH` | `/api/reports/admin/ban/:userId` | Admin | Ban a user |
| `PATCH` | `/api/reports/admin/unban/:userId` | Admin | Unban a user |
| `DELETE` | `/api/reports/admin/post/:postId` | Admin | Delete any post |
| `DELETE` | `/api/reports/admin/comment/:commentId` | Admin | Delete any comment |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + OTP Email Verification |
| File Storage | Cloudinary |
| Email | Nodemailer |

---

## 🤝 Team

| Role | Responsibility |
|---|---|
| Nikhil | Backend — API, Database, Auth, Business Logic |
| Prateeksha | Frontend — UI/UX, React Components, Styling |

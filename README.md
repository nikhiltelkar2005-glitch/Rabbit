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

- 🕵️ **Anonymous Posting** — Random identity like "Curious Rabbit #4521"
- 🗳️ **Upvote / Downvote** — Best posts rise to the top (Reddit-style)
- 💬 **Nested Comments** — Threaded discussion replies
- 🏘️ **Communities** — Campus Confessions, Ask Seniors, Lost & Found, Study Materials, Marketplace, Events
- 🔍 **Search** — Find questions and discussions
- ⭐ **Rabbit Karma** — Earn points from upvotes
- 🏅 **Achievement Badges** — Helpful Senior, Top Contributor, Placement Guru
- 🔥 **Trending** — Reddit-style decay algorithm
- 📊 **Polls** — Vote on campus decisions
- 📅 **Event Hub** — College clubs announce events
- 🛡️ **Safety** — College email verification, report system, admin panel, rate limiting

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

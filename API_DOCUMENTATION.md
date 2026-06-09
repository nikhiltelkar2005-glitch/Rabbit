# Rabbit API Documentation 🐰

Welcome, **Prateeksha** & **Nikhil**!
This document explains the complete Rabbit Backend API so the Frontend can easily connect to it.

The backend fully supports **Communities**, **Posts**, **Comments**, **Events**, **AMA**, **DMs**, **Notifications**, **Reports**, **Leaderboard**, with strict **College Silos**, **Trending algorithms**, **Achievement Badges**, **Post Flairs**, and **Media Uploads**!

## Base URL
All requests should be made to:
`http://localhost:5001/api`

> **Auth Header (Protected routes):** `Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication — `/api/auth`

### 1.1 Register
- **`POST /auth/register`**
- **Body:** `{ "email": "student@college.edu.in", "password": "SecurePassword123" }`
- Sends a 6-digit OTP to the college email.

### 1.2 Verify Email (OTP)
- **`POST /auth/verify-email`**
- **Body:** `{ "email": "student@college.edu.in", "otp": "123456" }`
- Returns `token` + `user` object on success. **Save the token!**

### 1.3 Login
- **`POST /auth/login`**
- **Body:** `{ "email": "...", "password": "..." }`
- Returns `token` + `user` object.

### 1.4 Get Current User (Protected)
- **`GET /auth/me`**
- Returns the logged-in user's profile.

### 1.5 Password Management
- **`POST /auth/forgot-password`** — `{ "email": "..." }` → sends reset OTP
- **`POST /auth/reset-password`** — `{ "email": "...", "otp": "...", "newPassword": "..." }`
- **`POST /auth/resend-otp`** — `{ "email": "..." }` → resends verification OTP

---

## 2. Communities — `/api/communities`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/communities` | ✅ | Get all communities in your college |
| `POST` | `/communities` | ✅ | Create a new community |
| `POST` | `/communities/:id/join` | ✅ | Join a community |

**Create body:** `{ "name": "masti", "description": "Just for fun!" }`

---

## 3. Posts — `/api/posts`

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/posts` | ✅ | Create a post (text, poll, or with image) |
| `GET` | `/posts/community/:communityId` | ✅ | Get posts (`?sort=hot\|new\|top&flair=placement`) |
| `POST` | `/posts/:id/vote` | ✅ | Upvote/downvote `{ "type": "upvote\|downvote\|none" }` |
| `POST` | `/posts/:id/vote-poll` | ✅ | Vote on poll option `{ "optionId": "..." }` |

**Create Post body (JSON or multipart/form-data for image upload):**
```json
{
  "title": "My Post",
  "content": "Hello!",
  "communityId": "<id>",
  "flair": "placement",
  "isPoll": false
}
```
**Available flairs:** `placement`, `exam_help`, `rant`, `advice`, `funny`, `confession`, `discussion`, `question`, `announcement`, `lost_found`

**Image upload:** Send as `multipart/form-data` with field name `image` (jpg/png/gif/webp).

---

## 4. Comments — `/api/comments`

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/comments` | ✅ | Create comment or reply |
| `GET` | `/comments/post/:postId` | ✅ | Get all comments for a post |
| `POST` | `/comments/:id/vote` | ✅ | Upvote/downvote a comment |

**Create body:**
```json
{
  "content": "Great post!",
  "postId": "<post_id>",
  "parentCommentId": null
}
```
Set `parentCommentId` to another comment's ID to reply to it.

---

## 5. Events — `/api/events`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/events` | ✅ | List events (`?filter=upcoming\|past\|all&tag=tech`) |
| `POST` | `/events` | ✅ | Create event |
| `GET` | `/events/:id` | ✅ | Get single event with attendee list |
| `POST` | `/events/:id/rsvp` | ✅ | Toggle RSVP (call again to un-RSVP) |
| `PATCH` | `/events/:id/cancel` | ✅ | Cancel event (organizer or admin) |
| `GET` | `/events/community/:communityId` | ✅ | Events by community |

**Create body:**
```json
{
  "title": "Tech Talk 2024",
  "description": "...",
  "venue": "Main Auditorium",
  "eventDate": "2024-12-15T18:00:00Z",
  "clubName": "Tech Club",
  "communityId": "<optional>",
  "tags": ["tech", "coding"],
  "maxAttendees": 100
}
```

---

## 6. Reports / Admin — `/api/reports`

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/reports` | User | Submit a report |
| `GET` | `/reports` | Admin | List reports (`?status=pending&targetType=post`) |
| `PATCH` | `/reports/:id` | Admin | Update status (`reviewed\|action_taken\|dismissed`) |
| `GET` | `/reports/admin/stats` | Admin | Dashboard — report counts + banned users |
| `PATCH` | `/reports/admin/ban/:userId` | Admin | Ban a user (`{ "banReason": "..." }`) |
| `PATCH` | `/reports/admin/unban/:userId` | Admin | Unban a user |
| `DELETE` | `/reports/admin/post/:postId` | Admin | Delete any post |
| `DELETE` | `/reports/admin/comment/:commentId` | Admin | Delete any comment |

**Submit report body:**
```json
{
  "targetType": "post",
  "targetId": "<id>",
  "reason": "spam",
  "details": "Optional extra context"
}
```
**Reason options:** `spam`, `harassment`, `hate_speech`, `misinformation`, `inappropriate_content`, `self_harm`, `other`

---

## 7. Anonymous DMs — `/api/dms`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/dms` | ✅ | Inbox — latest message per conversation |
| `POST` | `/dms` | ✅ | Send a DM |
| `GET` | `/dms/:anonymousName` | ✅ | Full conversation thread (auto-marks as read) |

**Send DM body:**
```json
{
  "recipientAnonymousName": "Curious Rabbit #4521",
  "content": "Hey, loved your post!",
  "originPostId": "<optional post id>"
}
```

---

## 8. AMA (Ask Me Anything) — `/api/amas`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/amas` | ✅ | List AMAs (`?filter=open\|closed\|all`) |
| `POST` | `/amas` | ✅ | Create AMA session |
| `GET` | `/amas/:id` | ✅ | Single AMA + all questions (sorted by upvotes) |
| `POST` | `/amas/:id/ask` | ✅ | Ask a question anonymously |
| `PATCH` | `/amas/:id/answer/:questionId` | ✅ | Answer a question (host only) |
| `POST` | `/amas/:id/questions/:questionId/upvote` | ✅ | Upvote a question (toggle) |
| `PATCH` | `/amas/:id/close` | ✅ | Close AMA early (host or admin) |

**Create AMA body:**
```json
{
  "title": "Ask me anything about SDE placements!",
  "description": "Placed at Google, happy to help.",
  "hostContext": "2024 Grad, SDE at Google",
  "endsAt": "2024-12-15T21:00:00Z",
  "tags": ["placements", "google", "sde"]
}
```

---

## 9. Notifications — `/api/notifications`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | ✅ | Get all notifications + `unreadCount` |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all as read |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark one as read |
| `DELETE` | `/notifications/:id` | ✅ | Delete a notification |

**Notification types:** `post_reply`, `comment_reply`, `post_upvote`, `badge_earned`, `event_reminder`, `ama_answer`, `dm_received`

> Poll every 30s or use a timer to fetch unread count for the notification bell.

---

## 10. Leaderboard — `/api/leaderboard`

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/leaderboard` | ✅ | Top karma earners + your own rank |

**Query params:** `?limit=10` (max 50)

**Response includes:**
```json
{
  "data": [
    { "rank": 1, "anonymousName": "...", "karma": 420, "badge": "Top Contributor" }
  ],
  "myStats": { "rank": 7, "anonymousName": "...", "karma": 85, "badge": "Active Member" }
}
```

---

## 11. Search — `/api/search`

- **`GET /search?q=internship`**
- Searches post titles/content and community names within your college.

---

## 12. Health Check

- **`GET /health`** — Returns `{ "success": true, "message": "🐰 Rabbit API is up and running!" }`

---

## 💻 Notes for Prateeksha (Frontend)

- **CORS:** Requests from `localhost:3000` or `localhost:5173` are allowed.
- **Auth:** Save `token` from login/verify-email. Send as `Authorization: Bearer <token>` on all protected routes.
- **Image uploads:** Use `multipart/form-data` (not JSON) when attaching an image to a post. Field name = `image`.
- **Notifications bell:** Poll `GET /notifications` every 30 seconds to update unread count.
- **DMs inbox:** Poll `GET /dms` every 30 seconds or on page focus.
- **Error handling:** All errors return `{ "success": false, "message": "..." }` — show `message` directly in UI.
- **Anonymous by default:** `author` on posts/comments is always `{ anonymousName, badge }` — real email is **never** exposed.

Happy Building! 🚀

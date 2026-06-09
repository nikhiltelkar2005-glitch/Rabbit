# Rabbit Project Roadmap 🐰

This document tracks the features we have added, what we are currently working on, and what is left to build. Since this is a month-long project, we will update this document as we make progress!

## ✅ Phase 1: Authentication & Security (Completed)
- [x] **College Email Verification:** Only students with college email can join.
- [x] **College Silos:** Strict database isolation so users only see content from their own college network.
- [x] **Anonymous Identity Generation:** Users get random names (e.g., "Curious Rabbit #4521") upon signup.
- [x] **Authentication System:** Login, Signup, OTP generation, and Password Reset.
- [x] **Basic User Model:** Stores email, password, and anonymous name.

## ✅ Phase 2: Core Functionality (Completed)
- [x] **Communities / Categories:** Allow users to create and browse categories (e.g., trolls, games, masti).
- [x] **Anonymous Posting:** Creating posts inside communities without revealing real names.
- [x] **Upvote / Downvote System:** Reddit-style voting where the best posts rise to the top.
- [x] **Comments & Replies:** Nested discussion threads under posts.
- [x] **Search:** Functionality to search for questions and discussions.

## ✅ Phase 3: Standout Features — "The College Vibe" (Completed)
- [x] **Campus Confessions:** Via `confession` post flair in any community.
- [x] **Ask Seniors:** Via AMA (Ask Me Anything) sessions — time-limited Q&A with placed students.
- [x] **Lost & Found:** Via `lost_found` post flair.
- [x] **Media Uploads:** Attach images to posts via Cloudinary.
- [x] **Post Flairs:** Tag posts as `placement`, `rant`, `advice`, `confession`, `exam_help`, `lost_found`, etc.

## ✅ Phase 4: Safety & Moderation (Completed)
- [x] **Content Moderation:** Report posts/comments/users/events — admin review panel with action workflow.
- [x] **Admin Panel:** Ban/unban users, delete any content, view stats dashboard.
- [x] **Anti-Spam:** Rate limiting on all endpoints — posts (5/hr), DMs (30/10min), OTP (3/10min), general (100/15min).

## ✅ Phase 5: Cool Features — Final Polish (Completed)
- [x] **Rabbit Karma:** Earn points from upvotes.
- [x] **Achievement Badges:** New Rabbit → Active Member → Top Contributor → Helpful Senior → Placement Guru.
- [x] **Trending Section:** Reddit-style hot score decay algorithm.
- [x] **Polls:** Vote on campus decisions (2–6 options, optional end date).
- [x] **Event Hub:** College clubs announce events with RSVP and capacity control.

## ✅ Phase 6: Engagement & Social (Completed)
- [x] **Anonymous DMs:** Message any user by their anonymous name, full conversation inbox.
- [x] **Anonymous AMA:** Time-limited Ask Me Anything sessions; host answers, community upvotes questions.
- [x] **Leaderboard:** Top karma earners in your college + your own rank.
- [x] **Notifications:** In-app alerts for replies, upvote milestones (10/50/100/500), badge upgrades, DMs, AMA answers.

## 🚧 Future Ideas (Backlog)
- [ ] **Real-time Notifications** — Socket.io WebSocket push instead of polling
- [ ] **College Marketplace** — Sell books, calculators, hostel items
- [ ] **Study Material Exchange** — Share notes, PDFs, previous year papers
- [ ] **Weekly Email Digest** — Top 5 posts from your communities every Monday
- [ ] **Shareable Post Links** — Unique URL per post for WhatsApp sharing
- [ ] **Edit / Delete own post** — Within a 15-minute window
- [ ] **Saved / Bookmarked Posts** — Save posts to read later

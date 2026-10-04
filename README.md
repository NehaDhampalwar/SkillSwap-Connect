# 🎓 SkillSwap Campus

> **Peer-to-Peer Skill Exchange Platform for College Students**  
> *Built for a 10-Hour Hackathon with React 18, Vite, Express.js, and Modern Custom Design System.*

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Backend Server & Frontend Dev Client
Run concurrently with one command:
```bash
npm run dev
```
* **Frontend (Vite):** [http://localhost:5173](http://localhost:5173)
* **Backend API (Express):** [http://localhost:5000](http://localhost:5000)

*(Alternatively, you can run `npm run server` and `npm run client` in separate terminals).*

---

## ⚡ The Winning 3-Minute Hackathon Demo Flow

1. **Open the Web App:** Navigate to `http://localhost:5173/`.
2. **Landing Page:** Show the modern SaaS hero, real-time campus metrics, and high-demand skills.
3. **Dashboard:** Click **"View My Dashboard"**. Notice you are signed in as **Alex Chen** (CS Sophomore: teaches *Python* & *Machine Learning*, wants to learn *UI/UX Design*).
4. **Discover & Match:** Go to **"Discover & Match"**. Point out the **"100% Mutual Skill Match"** glowing badge for **Sarah Jenkins** (HCI Junior: teaches *UI/UX Design* & *Graphic Design*, wants *Python*).
5. **Send Swap Proposal:** Click **"Propose Mutual Swap"** on Sarah's card. Notice the pre-filled reciprocal barter: *Python ↔ UI/UX Design*. Click **"Send Swap Proposal"**. A success toast confirms the action.
6. **Switch Persona (The "Aha!" Moment):** Click **"Sarah"** in the top **Hackathon Demo Bar**. The active user changes instantly to Sarah Jenkins, and her notification bell lights up!
7. **Accept Swap:** Open the **"Requests"** hub. Under *Incoming Proposals*, click **"Accept Swap"**.
8. **Schedule Learning Session:** Click **"Schedule Learning Session"**. Pick a library study room or video link and click **"Schedule Session"**.
9. **Complete Session:** Go to **"Sessions"**, locate the scheduled session with Alex, and click **"Mark Completed"**.
10. **Rate & Review:** Click **"Rate & Review Partner"**, give **5 Stars**, write a short review, and submit. Notice Alex's profile rating updates dynamically!
11. **Admin Panel:** Click **"Admin"** to show judges platform analytics, live barter counts, and full audit tables.

---

## 🛠 Features Implemented

* **1. Modern SaaS UI/UX:** Tailored HSL design tokens, deep glassmorphism cards, micro-interactions, responsive grids, and Lucide icons.
* **2. Smart 2-Way Mutual Matching Algorithm:** Detects reciprocal trades ($A_{teach} \in B_{learn} \land B_{teach} \in A_{learn}$) and calculates compatibility percentages with plain-English match rationales.
* **3. Swap Request Lifecycle:** Complete state machine: `Pending` $\rightarrow$ `Accepted` / `Rejected` $\rightarrow$ `Scheduled` $\rightarrow$ `Completed` $\rightarrow$ `Reviewed`.
* **4. Session Scheduling:** Calendar views with date, time, duration, campus location, and virtual meeting links.
* **5. Ratings & Verified Reviews:** 1–5 star interactive ratings, feedback testimonials, and dynamic average calculation.
* **6. Hackathon Demo Switcher:** 1-click top persona bar to switch between 6 pre-seeded college students (Alex, Sarah, Marcus, Priya, David, Elena) without tedious relogging.
* **7. Authentication & Profile Editor:** Register new students, update bio, availability, and dynamically add/remove teaching and learning skills.
* **8. Persistence:** Express REST API with file-backed storage (`server/db.json`) and instant reset capability.
* **9. Notifications Hub:** Real-time notifications for swap proposals, acceptances, scheduled sessions, and reviews.
* **10. Admin Demo Dashboard:** Real-time platform counters, student registry, swap logs, and completed session history.

Before generating any UI, carefully read and understand the complete system described below.

DO NOT generate any UI yet.
DO NOT create any pages yet.
ONLY understand, analyze, and plan the system structure.

---

🧠 PROJECT OVERVIEW:

Project Name:
"UniClub – A Web Application to Discover Clubs and Connect with People"

This is a dynamic, full-stack college club management platform.

The goal is to build a real working product — not a static website.

---

🚀 CORE IDEA:

This platform centralizes all college clubs and their activities into one system where:

- Students can explore and join clubs
- Clubs can organize events
- Events must be approved by faculty before being visible
- Students can register and attend events
- Attendance is managed digitally using QR or link
- The system prevents event timing clashes
- Clubs communicate through announcements
- Students provide feedback after events

---

⚙️ CORE SYSTEM RULES (CRITICAL):

- Everything must be dynamic (API-driven UI)
- No static or dummy content
- All data (clubs, events, users) must be fetched dynamically
- All forms should simulate real backend interaction
- UI must feel like a real working application, not just design

---

👥 USER ROLES & FLOWS:

🎓 STUDENT:
- Registers using OTP-based email verification
- Logs in and accesses dashboard
- Browses clubs (with filters)
- Joins clubs
- Registers for events
- Gets warning if event timing clashes
- Marks attendance via QR or link
- Submits feedback after events
- Receives announcements and notifications

---

👑 CLUB HEAD:
- Promoted student role
- Manages club details
- Adds volunteers
- Creates events (events are NOT directly published)
- Events go into "pending approval"
- Sends announcements
- Views participants

---

👨‍🏫 FACULTY:
- Associated with specific clubs
- Reviews event requests
- Approves or rejects events
- Monitors attendance
- Ensures system authenticity

---

🎯 KEY SYSTEM LOGIC (VERY IMPORTANT):

- Event is created → status = pending
- Faculty approves → event becomes visible
- Student tries to register → system checks time clash
- Attendance → QR or link-based
- Feedback → after event completion
- Notifications → dynamic and real-time

---

🗄️ BACKEND STATUS (IMPORTANT CONTEXT):

The backend is already partially built using:

- Spring Boot (Java)
- MySQL database
- REST APIs (basic user module working)

Current progress:
- Database schema is already designed and implemented
- User registration and login API is working
- Project structure is properly organized (controller, service, repository, entity)

⚠️ IMPORTANT:
- Do NOT modify backend logic
- Do NOT redesign database
- Do NOT assume static data
- UI must be compatible with existing backend

---

🧠 YOUR TASK (IMPORTANT):

1. First, understand the complete system
2. Internally plan:
   - Page structure
   - Component hierarchy
   - Data flow
3. Do NOT generate UI yet

---

⚠️ NEXT STEPS:

After this, a separate prompt will be given for the landing page.

Only after receiving that prompt:
- Start generating UI
- Follow the system rules strictly

---

🎯 GOAL:

Build a clean, modern, dynamic, real-world product UI — not a static template.

Acknowledge understanding and prepare for UI generation in the next step.
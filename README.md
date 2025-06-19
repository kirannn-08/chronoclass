# 📚 ChronoClass – Smart Class Management System

ChronoClass is a modern, lightweight class management web app built to streamline academic coordination between **Admins**, **Class Representatives (CRs)**, and **Students**.

This static frontend version uses **LocalStorage** for role-based access and in-browser data persistence — perfect for demos and offline use.

---

## 🚀 Features

- 🔐 **Role-Based Authentication**
  - Admin: Full control to create classes and assign CRs
  - CR: Add/edit syllabus, calendars, assignments
  - Student: View-only access to class-specific data

- 🏫 **Class Management Dashboard**
  - Admin can create class batches with branch, section, year
  - Assign CR credentials per class
  - CR and Students are bound to their respective class only

- 🧾 **Syllabus & Calendar Preview**
  - CRs can add Google Drive links for syllabus and academic calendars
  - Auto-embed live previews inside clean UI cards
  - Delete/pin options for CRs, view-only for students

- 📝 **Assignment & Exam Deadline Tracker**
  - CRs can add upcoming assignments and exams
  - Responsive UI that **arranges events by time left**
  - Helps students stay on top of deadlines

- 🕒 **Smart Class Count Section**
  - CRs can **manually tally each class** for every subject
  - Students can see how many classes have been completed and **on which dates**

- 📚 **Subject & Timetable Manager**
  - CRs can **add subjects** for their specific class
  - Basic timetable structure can be polished class-wise
  - Students can view timetable mapped to class

- 📂 **Resource Section**
  - CRs can upload important documents (PDFs, links, notes)
  - Students have quick access via embedded previews
 
currently this is only working for a single class , even after adding multiple classes , but to make it multi class i will owrk on the backend in future currently this is just a demo based on frontend and local storage.
thankyou!.

---

## 🧑‍💻 Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Google Drive Embed Previews
- LocalStorage (no backend yet)
- GitHub Pages (for live demo)

---

## 🧭 Project Structure

├── admin.html / css / js       # Admin dashboard
|
├── dashboard.html / css / js   # CR & student dashboard
|
├── login_reg.html / css / js   # Unified login & registration
|
├── README.md                   # This file

---

## 🌐 Live Demo

🔗 up to come



---

## 📌 Future Roadmap

- 🔗 Firebase or Custom Backend Integration
- 📊 CR-specific analytics & auto class tracking
- 📤 File uploads (instead of Drive links)
- 🌓 Dark mode toggle
- 📱 Mobile-first UI polish

---

## 🛠️ Setup & Deployment

1. Clone the repo
2. Open `login_reg.html` in your browser
3. Admin creates classes → CRs log in → Students access dashboards
4. Deploy on GitHub Pages (via repo Settings > Pages)

---

## 👤 Author

**Ravelli Kiran Venkat**  
B.Tech EEE, NIT Warangal  
GitHub: [@kirann-08][(https://github.com/kirannn-08)]

---
---

## ⚠️ Disclaimer & Usage Policy

This is a **personal project** created and maintained by **Ravelli Kiran Venkat**.

All content, design, and logic are **original work** and are **not permitted for commercial use, redistribution, or reproduction** without explicit permission.

📌 **You are not allowed to:**
- Copy or reuse any part of the source code
- Host or distribute this project under your own name
- Use this project for any public or commercial application

This repository is for **personal learning and portfolio purposes only.**


## 📄 License
All Rights Reserved.

Copyright (c) 2025 Ravelli Kiran Venkat

This project is the intellectual property of the author.  
No part of this codebase may be copied, reused, redistributed, or modified without written permission.  
Unauthorized use is strictly prohibited.

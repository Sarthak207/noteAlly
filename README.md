# NoteAlly

> **NoteAlly** is a modern Next.js application for students to **upload, share, browse, and download high-quality study notes**.  
> It features user authentication, note management, likes/views tracking, searches, and a dark mode UI.

---

## Features

- **User Authentication** (Email+Password + Google Sign-In) with Firebase Auth
- **Upload Notes** as PDF files with metadata (Title, Subject)
- **Browse Shared Notes** with:
  - Filters by subject ("folder"-style)
  - Search by title or subject
  - Like and view counts on notes
- **User Dashboard** to manage your uploaded notes:
  - View statistics (Total notes, Likes, Views)
  - Download/delete your notes
- Full **Dark Mode** toggle with smooth transitions
- Responsive UI using **Tailwind CSS**
- Real-time updates via Firestore listeners
- Comments support (optional - if implemented)
  
---

## Tech Stack

- [Next.js 13+](https://nextjs.org/) (App Router)
- [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Hot Toast](https://react-hot-toast.com/) for notifications

---

## Demo

> https://note-ally-m75y.vercel.app/

---

## Folder Structure Overview

src/
├── app/
│ ├── layout.js # Root layout with global nav, footer, and dark mode toggle
│ ├── page.js # Home page
│ ├── login/page.js # Login & Sign Up forms
│ ├── dashboard/page.js # User dashboard to manage uploaded notes
│ ├── notes/
│ │ ├── layout.js # Optional layout for notes section
│ │ └── page.js # Notes browsing with folder filter and likes
│ └── upload/page.js # Note upload page
├── firebase.js # Firebase initialization and exports
└── globals.css # Tailwind CSS + custom global styles

## Contact

Created by **Sarthak207**.  
For questions, contact: *sarthakpardeshi207@gmail.com*

---

Enjoy using NoteAlly! 🚀



# AttendEase - Student Attendance Management System

A simple website for the PT101 Platform Technologies class, using **HTML, CSS, and JavaScript**. This code has been formatted and given comments to make it easier for a second-year BSIT student to read and explain. The original design, demo users, records, and features are retained.

## Project files

- `index.html` - login page, dashboard, forms, tables, and other website sections
- `style.css` - colors, layout, buttons, tables, responsive/mobile design
- `script.js` - sample student data, attendance, buttons, reports, and browser storage

## How to run

1. Keep `index.html`, `style.css`, and `script.js` together in one folder.
2. Open that folder in VS Code.
3. Open `index.html` using **Live Server**, or open it directly in your browser.
4. Choose a demo role on the login page. All demo accounts use password `demo123`.

## Features

- Administrator, instructor, and student demo sign-in
- Dashboard with attendance totals and charts
- Student directory: search, view, add, edit, and delete (staff roles)
- Daily attendance: present, absent, late, and save
- Class listing and student attendance history
- Reports by date and month, with date/class filtering
- Download student and attendance data as CSV
- Print reports; reset demo data (administrator)
- Mobile-friendly sidebar and layout

## Where information is saved

This is a **frontend-only classroom prototype**. Student records and attendance are stored in your own browser using `localStorage`, not in an online database. Demo login is not secure authentication; do not store real student private data here.

**Important:** The `localStorage` key is kept unchanged. Existing saved data on the **same site/browser origin** should remain available after replacing the source files. Data from a different URL or browser may not appear.

## Updating the GitHub repository

Replace the existing `index.html`, `style.css`, `script.js`, and `README.md` files with these updated versions, then commit the changes. Keep the filenames exactly the same. If your Vercel site is connected to GitHub, pushing to its production branch usually starts a new deployment.

## Beginner explanation

- **HTML:** creates the elements displayed on the website.
- **CSS:** controls the website's appearance.
- **JavaScript:** handles user actions and updates the displayed data.
- **localStorage:** temporarily acts like a small database in the current browser.

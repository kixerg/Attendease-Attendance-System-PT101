# AttendEase - Student Attendance Management System

A simple website for the PT101 Platform Technologies class, using HTML, CSS, and JavaScript.
## Project files

- `index.html` - login page, dashboard, forms, tables, and other website sections
- `style.css` - colors, layout, buttons, tables, responsive/mobile design
- `script.js` - sample student data, attendance, buttons, reports, and browser storage

## Software Stack Diagram
<img width="1535" height="1024" alt="AttendEase Software Stack Diagram" src="https://github.com/user-attachments/assets/5cfcaa91-2afa-4a25-8115-d01bf87ccf19" />

## How to run

1. Keep `index.html`, `style.css`, and `script.js` together in one folder.
2. Open that folder in VS Code.
3. Open `index.html` using **Live Server**, or open it directly in your browser.
4. Choose one of the original demo roles, or type an instructor username and password manually. The three original demo buttons still use password `demo123`.

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

## Updated IT-2109 subject schedule

The Subjects / Classes page contains the eight subjects from the supplied class timetable, including the instructor, meeting days, times and rooms. The attendance Subject selector and report filters now use the subject codes; the five students still belong to section BSIT-2109.

| Code | Subject | Instructor | Schedule |
|---|---|---|---|
| AI 101 | Linear Algebra for AI | Ocampo, Ronalyn P. | Sat 1–4 PM |
| CC 104 | Information Management | Gabuya, Jenny Mae A. | Thu 10 AM–12 PM and 1–4 PM |
| GEd 107 | Ethics | Rabi, Aries N. | Wed 2–5 PM |
| NET 101 | Fundamentals of Computer Networking | Pernia, Crissy M. | Wed 7–10 AM and 10 AM–12 PM |
| OOP 101 | Object-Oriented Programming | Garcia, Donna M. | Fri 7–10 AM and 10 AM–12 PM |
| PATHFit 3 | Choice of Dance, Sports, Martial Arts, Group Exercise, Outdoor, and Adventure Activities 1 | Real, Mark Ernest D. | Sat 5–7 PM |
| PHYS 111 | General Physics 1 | Lucero, Aubrey May P. | Fri 1–4 PM and 4–6 PM |
| PT 101 | Platform Technologies | Marquez, Jayson M. | Thu 7–10 AM and 4–6 PM |

The project keeps the same browser storage key. When existing attendance data is found from the older one-subject version, its old section-based attendance entries are assigned to PT 101 so those saved statuses are not discarded. New sample records are created per scheduled subject meeting when the browser has no saved data.

## Pre-created instructor accounts (classroom demo only)

Instructor credentials **are not displayed on the login page**. Use the username and password directly in the login fields. Each instructor can record attendance and see reports for their assigned subject only.

| Instructor | Assigned subject | Username | Password |
|---|---|---|---|
| Ronalyn P. Ocampo | AI 101 - Linear Algebra for AI | `ronalyn.ocampo25` | `Rona47!p` |
| Jenny Mae A. Gabuya | CC 104 - Information Management | `jenny.gabuya25` | `Jenn82!y` |
| Aries N. Rabi | GEd 107 - Ethics | `aries.rabi25` | `Arie39!s` |
| Crissy M. Pernia | NET 101 - Fundamentals of Computer Networking | `crissy.pernia25` | `Cris64!y` |
| Donna M. Garcia | OOP 101 - Object-Oriented Programming | `donna.garcia25` | `Donn21!a` |
| Mark Ernest D. Real | PATHFit 3 | `mark.real25` | `Mark75!r` |
| Aubrey May P. Lucero | PHYS 111 - General Physics 1 | `aubrey.lucero25` | `Aubr96!y` |
| Jayson M. Marquez | PT 101 - Platform Technologies | `jayson.marquez25` | `Jays53!n` |

### Original quick-fill demo accounts (still available)

| Button | Email | Password |
|---|---|---|
| Administrator | `admin@batstate-u.edu.ph` | `demo123` |
| Instructor | `instructor@batstate-u.edu.ph` | `demo123` |
| Student | `student@batstate-u.edu.ph` | `demo123` |

**Warning:** This is a public frontend-only prototype. The credentials are included in the JavaScript and this README, so they are not secret or safe for real instructor use. Subject permissions are only simulated in the browser. A real school application needs secure server-side login and permissions.

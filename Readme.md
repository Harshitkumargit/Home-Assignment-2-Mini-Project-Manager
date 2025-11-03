# 📋 Task Manager — Mini Project Manager

A full-stack **Task Management** web application with an **AI-powered assistant bot**, built with **React + TypeScript** (frontend) and **.NET 8** (backend).  
Lightweight, mobile friendly, and ready to extend — ideal as a portfolio project or base for production features.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
[![Frontend: Vite](https://img.shields.io/badge/Frontend-Vite-blue.svg)]() [![Backend: .NET 8](https://img.shields.io/badge/Backend-.NET%208-512BD4.svg)]()

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Using Docker (optional)](#using-docker-optional)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author & Support](#author--support)
- [Acknowledgements & Resources](#acknowledgements--resources)

---

## ✅ Features

- User Authentication (register / login) with secure password hashing  
- Project CRUD (Create, Read, Update, Delete)  
- Task CRUD inside projects with due date/time and status (todo / in-progress / completed)  
- Real-time UI updates and progress tracking (progress bars)  
- AI Assistant Bot for natural-language task/project creation & automation  
- Dark / Light theme with UI persistence option  
- Password show/hide toggle and strength indicator during registration  
- Responsive UI (desktop & mobile) and accessibility considerations (ARIA, keyboard nav)  
- Notifications, loading states, and smooth transitions

---

## 🧰 Tech Stack

**Frontend**
- React 18 + TypeScript  
- Vite (dev server / bundler)  
- Tailwind CSS (styling)  
- React Router v6 (routing)  
- Axios (HTTP client)  
- Lucide React (icons)

**Backend**
- .NET 8 (ASP.NET Core Web API)  
- Entity Framework Core (ORM)  
- SQLite (default local DB) — switchable to other DBs easily  
- JWT (JSON Web Tokens) for stateless auth  
- CORS configured for local dev

---

## 📸 Screenshots

- Desktop dashboard —   <img width="1885" height="843" alt="Screenshot 2025-11-03 185409" src="https://github.com/user-attachments/assets/b0dace8b-5465-471a-8ac2-005bbfe3bad8" />
  
- AI Assistant Modal — ![Uploading Screenshot 2025-11-03 185429.png…](<img width="1827" height="844" alt="Screenshot 2025-11-03 185548" src="https://github.com/user-attachments/assets/d2f10eef-22d9-48e2-9b6b-499eee3f14b9" />
<img width="1875" height="857" alt="Screenshot 2025-11-03 185429" src="https://github.com/user-attachments/assets/411e824e-890f-43b7-8d3e-fdd25497ad4c" />
<img width="1872" height="833" alt="Screenshot 2025-11-03 185520" src="https://github.com/user-attachments/assets/084d1514-3012-493e-a18f-414745f61092" />

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+ and npm (or yarn)  
- .NET 8 SDK  
- Git

---

### ⚡ Frontend Setup

```bash
# from repo root
cd frontend
```
```bash
# Install dependencies
npm install
```
```bash
# Create .env.local (example)
# .env.local
VITE_API_URL=http://localhost:5000
```
```bash
# Start dev server
npm run dev
```
### ⚡ Backend Setup

```bash
# from repo root
cd backend
```
```bash
# restore packages
dotnet restore
```
```bash
# run the API
dotnet run
```
###📚 Project Structure

Home-Assignment-2-Mini-Project-Manager/
├── frontend/ (React + TypeScript frontend)
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API integration with Axios
│   │   ├── context/           # React Context for state management
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/ (.NET API)
│   ├── Models/                # Data models
│   ├── DTOs/                  # Data Transfer Objects
│   ├── Services/              # Business logic
│   ├── Data/                  # Database context
│   ├── Program.cs             # Application startup
│   ├── ProjectManagerAPI.csproj
│   └── projectmanager.db      # SQLite database
│
└── README.md
🔌 API Endpoints
🧾 Authentication
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Login user

### 📁 Projects
Method	Endpoint	Description
GET	/projects	Get all projects
GET	/projects/{id}	Get project by ID
POST	/projects	Create new project
PUT	/projects/{id}	Update project
DELETE	/projects/{id}	Delete project

### 🧩 Tasks
Method	Endpoint	Description
GET	/projects/{projectId}/tasks	Get all tasks for project
POST	/projects/{projectId}/tasks	Create new task
PUT	/tasks/{taskId}	Update task
PATCH	/tasks/{taskId}/toggle	Toggle completion
DELETE	/tasks/{taskId}	Delete task

### 🔐 Authentication Flow
User registers with email and password

Backend validates and securely hashes password

On login, backend issues JWT token

Token stored in localStorage

All API requests include token in Authorization header


### 📖 Usage Guide
1. Creating a Project

2. Click "+ New Project"

3. Enter name and description

4. Click Create

5. Creating a Task

6. Open a project

7. Click "+ New Task"

8. Enter title & due date/time

9. Click Create

10. Completing a Task

11. Check the checkbox next to task

12. Task marked as completed

13. Progress bar updates automatically

### Using AI Assistant Bot
1. Click 🤖 icon (bottom right)

2. Type commands like:

3. “Create a task called Design UI”

    “Create a project called Website”

4. Bot performs the action instantly

### 🔄 Database Schema
Users Table

Column	Type	Description
Id	PK	Unique user ID
Email	Text	Unique email
PasswordHash	Text	Secure hash
Name	Text	User name
CreatedAt	DateTime	Timestamp

Projects Table

Column	Type	Description
Id	PK	Project ID
UserId	FK	Linked user
Name	Text	Project name
Description	Text	Details
CreatedAt	DateTime	Created timestamp
UpdatedAt	DateTime	Updated timestamp

Tasks Table

Column	Type	Description
Id	PK	Task ID
ProjectId	FK	Parent project
Title	Text	Task name
Description	Text	Task details
Status	Enum	todo/in-progress/completed
DueDate	DateTime	Optional deadline
CreatedAt	DateTime	Created timestamp
UpdatedAt	DateTime	Updated timestamp

🤝 Contributing
Fork the repository

Create a feature branch:

```bash
Copy code
git checkout -b feature/AmazingFeature
```
Commit changes:

```bash
Copy code
git commit -m "Add AmazingFeature"
```
Push to branch:

```bash
Copy code
git push origin feature/AmazingFeature
```
Open a Pull Request

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

👨‍💻 Author
Harshit Kumar
GitHub: @Harshitkumargit

📧 Support
For support, email: support@example.com
or open an issue on GitHub.

🎯 Roadmap
 Dark mode persistence

 Task filtering and sorting

 Subtasks support

 Task comments and collaboration

 Calendar view

 Notifications

 Export to PDF

 Team collaboration features

📚 Learning Resources
React Documentation

TypeScript Handbook

.NET Documentation

Tailwind CSS


# 📋 Task Manager - Mini Project Manager

A full-stack task management application with **AI-powered assistant bot**, built using **React**, **TypeScript**, and **.NET**.

---

## ✅ Features

- **User Authentication** – Secure login & registration with password validation  
- **Project Management** – Create, read, update, and delete projects  
- **Task Management** – Organize tasks within projects with due dates and times  
- **Progress Tracking** – Visual progress bars and completion statistics  
- **AI Assistant Bot** – Chat-based task creation and project automation  
- **Dark/Light Theme** – Toggle between light and dark modes  
- **Account Menu** – View profile, stats, and logout  
- **Eye Icon Password Toggle** – Show/hide passwords during registration  
- **Password Strength Indicator** – Real-time password validation  
- **Engaging Greetings** – Rotating greeting messages for better UX  
- **Responsive Design** – Works seamlessly on desktop and mobile  
- **Real-time Updates** – Instant task and project status changes  

---

## 📦 Tech Stack

### 🖥️ Frontend

- **React 18** – Modern UI library with Hooks  
- **TypeScript** – Static type checking for JavaScript  
- **React Router v6** – Client-side routing  
- **Tailwind CSS** – Utility-first CSS framework  
- **Axios** – Promise-based HTTP client  
- **Lucide React** – Beautiful SVG icon library  
- **Vite** – Next-generation frontend build tool  

### ⚙️ Backend

- **.NET 8** – Modern web framework  
- **Entity Framework Core** – ORM for database operations  
- **SQLite** – Lightweight database  
- **JWT (JSON Web Tokens)** – Secure authentication  
- **CORS** – Cross-origin request handling  

---

## 🛠️ Installation

### Prerequisites

- Node.js v16+ & npm  
- .NET 8 SDK  
- Git  

---

### ⚡ Frontend Setup

```bash
cd frontend
npm install
Create a .env.local file:

bash
Copy code
VITE_API_URL=http://localhost:5000
Start the development server:

bash
Copy code
npm run dev
App will be available at: http://localhost:5173

⚙️ Backend Setup
bash
Copy code
cd backend
dotnet restore
dotnet run
API will be available at: http://localhost:5000

📚 Project Structure
graphql
Copy code
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

📁 Projects
Method	Endpoint	Description
GET	/projects	Get all projects
GET	/projects/{id}	Get project by ID
POST	/projects	Create new project
PUT	/projects/{id}	Update project
DELETE	/projects/{id}	Delete project

🧩 Tasks
Method	Endpoint	Description
GET	/projects/{projectId}/tasks	Get all tasks for project
POST	/projects/{projectId}/tasks	Create new task
PUT	/tasks/{taskId}	Update task
PATCH	/tasks/{taskId}/toggle	Toggle completion
DELETE	/tasks/{taskId}	Delete task

🔐 Authentication Flow
User registers with email and password

Backend validates and securely hashes password

On login, backend issues JWT token

Token stored in localStorage

All API requests include token in Authorization header

js
Copy code
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
🎨 UI/UX Features
💻 Responsive Design
Desktop-optimized layout

Mobile-friendly card-based views

Touch-friendly components

⚡ Visual Feedback
Loading spinners

Error/success notifications

Smooth transitions

♿ Accessibility
Semantic HTML

ARIA labels

Keyboard navigation

High color contrast

🚀 Deployment
🌐 Frontend (Vercel)
Push code to GitHub:

bash
Copy code
git add .
git commit -m "Deploy to Vercel"
git push origin main
Go to Vercel

Connect GitHub repository

Add environment variable:

bash
Copy code
VITE_API_URL=<backend-url>
Deploy!

🔧 Backend (Render)
Ensure Dockerfile exists

Go to Render

Create new Web Service

Connect GitHub repo → Deploy

📝 Environment Variables
Frontend (.env.local)
ini
Copy code
VITE_API_URL=http://localhost:5000
Production
ini
Copy code
VITE_API_URL=https://your-backend-url.com
🧪 Build & Run
Development Mode
bash
Copy code
# Frontend
cd frontend && npm run dev

# Backend
cd backend && dotnet run
Production Build
bash
Copy code
# Frontend
cd frontend && npm run build && npm run preview

# Backend
cd backend && dotnet publish -c Release
🐛 Troubleshooting
Issue	Solution
Backend not reachable	Ensure backend runs on port 5000 & check .env.local
Login fails	Verify credentials, database init, or clear localStorage
Tasks not loading	Verify token, restart backend, or clear browser cache

📖 Usage Guide
Creating a Project
Click "+ New Project"

Enter name and description

Click Create

Creating a Task
Open a project

Click "+ New Task"

Enter title & due date/time

Click Create

Completing a Task
Check the checkbox next to task

Task marked as completed

Progress bar updates automatically

Using AI Assistant Bot
Click 🤖 icon (bottom right)

Type commands like:

“Create a task called Design UI”

“Create a project called Website”

Bot performs the action instantly

🔄 Database Schema
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

bash
Copy code
git checkout -b feature/AmazingFeature
Commit changes:

bash
Copy code
git commit -m "Add AmazingFeature"
Push to branch:

bash
Copy code
git push origin feature/AmazingFeature
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

⭐ If you found this helpful, please give it a star!

yaml
Copy code

---

Would you like me to generate the **GitHub badge section (tech + language shields)** at the top too?  
That can make your README look even more professional (like top open-source repos).

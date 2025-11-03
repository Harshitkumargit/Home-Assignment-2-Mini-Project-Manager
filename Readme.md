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

> Replace these with actual images in `/frontend/public/screenshots/` and update links below.

- Desktop dashboard — `./assets/screenshot-dashboard.png`  
- Mobile view — `./assets/screenshot-mobile.png`  
- AI Assistant Modal — `./assets/screenshot-ai-bot.png`

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

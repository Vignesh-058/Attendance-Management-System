# Enterprise College Attendance Management System

A comprehensive, enterprise-grade Full-Stack Attendance Management System featuring dedicated portals for Students, Teachers, and Administrators. This application is built with modern web technologies, providing secure authentication, strict role-based access control, transaction-safe database operations, and dynamic dashboards for managing attendance records effectively.

## 🚀 Key Features

- **Multi-Role Portals:** Custom dashboards tailored for Students, Teachers, and Admins.
- **Enterprise Security:** 
  - Strict password policies and role-based access controls (RBAC).
  - API endpoint payload validation using Zod.
  - Automatic Account Lockout (15-min lockout after 5 failed attempts) to prevent brute-force attacks.
- **Robust Authentication:** JWT-based authentication with bcrypt hashing. Includes rotating Refresh Tokens and automated token cleanup via `node-cron`.
- **OTP Password Reset:** Secure One-Time Password flow via Ethereal email for password recovery.
- **Transactional Integrity:** TypeORM `QueryRunner` is used for marking attendance to guarantee atomic database updates (preventing orphan records).
- **Observability:** Winston-powered structured logging and `/health` endpoints.
- **Advanced Reporting:** Export endpoints capable of generating Excel (CSV) and PDF files.
- **Performance & Caching:** Redis caching for fast dashboard analytics retrieval (with graceful degradation if Redis fails).
- **CI/CD & DevOps:** Dockerized backend and frontend. Automated GitHub Actions CI pipelines for tests and deployment.

---

## 🛠️ Tech Stack

- **Frontend:** Angular 18+, Angular Material, CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (via TypeORM 0.3.x)
- **Caching:** Redis
- **DevOps:** Docker, Docker Compose, GitHub Actions
- **Utilities:** Zod (Validation), Swagger (API Docs), Winston (Logging), ExcelJS & PDFKit (Export)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- Redis
- Docker (optional but recommended)

### Quick Start (Docker)

To run the application using Docker Compose:
1. `docker-compose up --build`
2. The Frontend will be available at `http://localhost:4200`
3. The Backend API will be available at `http://localhost:3000`
4. Swagger API Documentation will be available at `http://localhost:3000/api-docs`

### Manual Setup

#### Backend
1. Navigate to the `backend/` directory.
2. Duplicate `.env.example` to `.env` and fill in your PostgreSQL and Redis credentials.
3. Run `npm install` to install dependencies.
4. Run `npm run build` to compile the TypeScript code.
5. Run `npm start` (or `npm run dev` for hot-reloading) to start the Express backend.

#### Frontend
1. Navigate to the `frontend/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the Angular frontend.

---

## 🔑 Demo Credentials

Upon initial database seeding (via `/api/auth/seed`), a Super Admin is created using the credentials specified in your `.env` file. By default, it requires a secure password.

### 🛡️ Administrator Portal (Example Setup)
| Field | Value |
| --- | --- |
| **Email** | `admin@college.edu` |
| **Password** | `ComplexAdminPassword1!` |

*(Note: Admins are the only users who can create other Admins via the User Management panel. Public registration only allows Teachers and Students).*

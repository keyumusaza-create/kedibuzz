# KEDI Smart School - Technical Specification

## Project Overview

**Project Name:** KEDI Smart School - Class Management & Assessment System  
**Type:** Full-stack Web & Mobile Application  
**Core Functionality:** School management system supporting class management, attendance tracking, marks/assessment recording, and online exam simulation  
**Target Users:** Administrators, Teachers, Students

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend API | Django 4.2+ with Django Rest Framework |
| Database | PostgreSQL |
| Authentication | JWT (djangorestframework-simplejwt) |
| Web Frontend | React 18+ with Vite |
| Mobile App | React Native with Expo |
| UI Library | Custom components |

---

## 1. User Roles & Permissions

### Role Matrix

| Role | Permissions |
|------|-------------|
| Admin | Full system access, user management, school config |
| Teacher | Class management, attendance, marks, exams, reports |
| Student | View profile, take exams, view results, attendance |

### Authentication Endpoints

```
POST /api/auth/register/     - Register new user
POST /api/auth/login/       - Login (returns JWT)
POST /api/auth/refresh/     - Refresh token
GET  /api/auth/me/          - Current user profile
```

---

## 2. Database Models

### User Model (Extended Django User)

```
- id: UUID (primary key)
- email: string (unique)
- username: string (unique)
- password: hashed
- role: enum (admin, teacher, student)
- first_name: string
- last_name: string
- phone: string (optional)
- created_at: datetime
- updated_at: datetime
```

### Class Model

```
- id: UUID
- name: string (e.g., "Primary 1A", "Form 2")
- level: string (e.g., "Primary", "Secondary")
- academic_year: string (e.g., "2024-2025")
- subjects: many-to-many (Subject)
- students: many-to-many (Student)
- class_teacher: ForeignKey (Teacher)
- created_at: datetime
- updated_at: datetime
```

### Subject Model

```
- id: UUID
- name: string (e.g., "Mathematics", "English")
- code: string (e.g., "MATH", "ENG")
- description: text
- created_at: datetime
```

### Attendance Model

```
- id: UUID
- student: ForeignKey (Student)
- class: ForeignKey (Class)
- date: date
- status: enum (present, absent, late)
- notes: text (optional)
- recorded_by: ForeignKey (Teacher)
- created_at: datetime
```

### Assessment Model (Marks)

```
- id: UUID
- student: ForeignKey (Student)
- subject: ForeignKey (Subject)
- class: ForeignKey (Class)
- score: decimal
- total_marks: decimal
- assessment_type: enum (quiz, assignment, exam)
- date: date
- recorded_by: ForeignKey (Teacher)
- created_at: datetime
```

### Exam Model

```
- id: UUID
- title: string
- description: text
- subject: ForeignKey (Subject)
- class: ForeignKey (Class)
- duration_minutes: integer
- randomize_questions: boolean
- is_published: boolean
- created_by: ForeignKey (Teacher)
- created_at: datetime
- updated_at: datetime
```

### Question Model

```
- id: UUID
- exam: ForeignKey (Exam)
- question_text: text
- question_type: enum (multiple_choice, short_answer)
- options: JSON (for multiple choice)
- correct_answer: string
- marks: decimal
- order: integer
```

### Result Model

```
- id: UUID
- student: ForeignKey (Student)
- exam: ForeignKey (Exam)
- score: decimal
- total_marks: decimal
- answers: JSON
- started_at: datetime
- submitted_at: datetime
- is_graded: boolean
```

---

## 3. REST API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login with credentials |
| POST | /api/auth/refresh/ | Refresh JWT token |
| GET | /api/auth/me/ | Get current user |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students/ | List all students |
| POST | /api/students/ | Create student |
| GET | /api/students/{id}/ | Get student detail |
| PUT | /api/students/{id}/ | Update student |
| DELETE | /api/students/{id}/ | Delete student |
| GET | /api/students/{id}/attendance/ | Student attendance history |
| GET | /api/students/{id}/marks/ | Student marks history |
| GET | /api/students/{id}/results/ | Student exam results |

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/classes/ | List all classes |
| POST | /api/classes/ | Create class |
| GET | /api/classes/{id}/ | Get class detail |
| PUT | /api/classes/{id}/ | Update class |
| DELETE | /api/classes/{id}/ | Delete class |
| POST | /api/classes/{id}/students/ | Add student to class |
| DELETE | /api/classes/{id}/students/{student_id}/ | Remove student from class |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/attendance/ | List attendance records |
| POST | /api/attendance/ | Record attendance |
| GET | /api/attendance/{id}/ | Get attendance detail |
| PUT | /api/attendance/{id}/ | Update attendance |
| GET | /api/attendance/class/{class_id}/ | Class attendance by date |
| GET | /api/attendance/report/ | Attendance report |

### Marks/Assessment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/marks/ | List assessment records |
| POST | /api/marks/ | Record marks |
| GET | /api/marks/{id}/ | Get marks detail |
| PUT | /api/marks/{id}/ | Update marks |
| GET | /api/marks/subject/{subject_id}/ | Subject marks |
| GET | /api/marks/class/{class_id}/ | Class average marks |

### Exams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/exams/ | List exams |
| POST | /api/exams/ | Create exam |
| GET | /api/exams/{id}/ | Get exam detail |
| PUT | /api/exams/{id}/ | Update exam |
| DELETE | /api/exams/{id}/ | Delete exam |
| GET | /api/exams/{id}/questions/ | Exam questions |
| POST | /api/exams/{id}/questions/ | Add question to exam |
| POST | /api/exams/{id}/publish/ | Publish exam |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/results/ | List results |
| GET | /api/results/student/ | Student results |
| POST | /api/results/ | Submit exam (create result) |
| GET | /api/results/{id}/ | Get result detail |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/teacher/ | Teacher dashboard data |
| GET | /api/dashboard/student/ | Student dashboard data |

---

## 4. Web Application Structure

### Pages

| Role | Pages |
|------|-------|
| Admin | Login, Dashboard, User Management, Classes, Reports |
| Teacher | Login, Dashboard, Classes, Attendance, Marks, Exams, Reports |
| Student | Login, Dashboard, Exams, Results, Profile |

### Components

- `Layout` - Main layout wrapper
- `Sidebar` - Navigation sidebar
- `Header` - Top header with user menu
- `DataTable` - Reusable data table
- `Card` - Statistics cards
- `FormInput` - Form input fields
- `Button` - Action buttons
- `Modal` - Modal dialogs
- `Badge` - Status badges
- `Avatar` - User avatars

---

## 5. Mobile Application Structure

### Screens

| Role | Screens |
|------|---------|
| Student | Login, Exam List, Take Exam, Results, Profile |
| Teacher | Login, Class List, Attendance, Enter Marks |

---

## 6. Acceptance Criteria

### Backend
- [ ] All API endpoints return proper JSON responses
- [ ] JWT authentication works correctly
- [ ] Role-based access control enforced
- [ ] Database migrations run successfully
- [ ] API documentation available via DRF schema

### Web
- [ ] Login/logout functionality works
- [ ] Dashboard displays correct data
- [ ] Class management CRUD operations work
- [ ] Attendance recording works
- [ ] Marks entry works
- [ ] Exam creation works
- [ ] Reports generate correctly

### Mobile
- [ ] Student can login
- [ ] Student can take exam with timer
- [ ] Student can view results
- [ ] Teacher can record attendance
- [ ] Teacher can enter marks
- [ ] Offline data storage works

---

## 7. Security Requirements

- Password hashing with Django's PBKDF2
- JWT tokens with short expiry (15 min access, 1 day refresh)
- Role-based permissions on all endpoints
- CORS configuration for frontend
- Rate limiting on auth endpoints

---

## 8. File Structure

```
KEDISCS/
├── backend/                 # Django API
│   ├── kediscs/            # Project settings
│   ├── accounts/          # User management
│   ├── classes/           # Class management
│   ├── attendance/        # Attendance
│   ├── marks/             # Assessment/Marks
│   ├── exams/             # Exams
│   └── requirements.txt
│
├── web/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── mobile/                 # React Native App
│   ├── src/
│   └── package.json
│
└── SPEC.md
```
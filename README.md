# AcademiQuiz - Online Assessment & Examination Platform

A complete, production-grade, college-level Online Quiz & Examination Platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui design patterns, Prisma ORM, and Neon Serverless PostgreSQL.

---

## 1. Project Overview

AcademiQuiz provides an academic examination ecosystem designed for colleges and universities. It enables faculty to construct robust multi-choice examinations with dynamic question weighting, time constraints, and draft controls, while providing students with a synchronized examination environment, live countdown timers, instant autosave, and detailed post-exam analytics.

### Key Highlights
- **Role-Based Access Control (RBAC):** Admin, Teacher, and Student roles with protected dashboard layouts, middleware guards, and server-side authorization checks on all mutations.
- **Server-Authoritative Evaluation:** Student scores, percentages, and pass/fail statuses are computed on the server inside atomic database transactions. Client-side timers, submitted scores, or correct answer flags are never trusted.
- **Security-First Architecture:** Correct answers (`isCorrect`) are isolated in the database and never exposed in quiz-taking payloads before final submission.
- **Synchronized Exam Taking:** Live countdown timer synced with server-calculated expiration time (`expiresAt`). Real-time autosave of selections and automatic submission when the deadline expires.
- **Analytics & Visualizations:** Interactive Recharts dashboards for faculty, students, and administrators tracking participation, class averages, and pass/fail distributions.

---

## 2. Technology Stack

- **Frontend Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui architectural patterns (accessible custom primitives, modals, toasts, cards, badges)
- **Icons:** Lucide React
- **ORM:** Prisma ORM 5.22.0
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** Credentials-based authentication using Argon2/bcrypt (`bcryptjs`) & JOSE (`jose` HS256 JWT secure httpOnly session cookies)
- **Validation:** Zod schemas & React Hook Form
- **Data Visualization:** Recharts
- **Testing:** Vitest unit & integration test suites

---

## 3. User Roles & Capabilities

### 👑 Administrator
- Global platform overview (Total students, faculty, quizzes, and completed attempts).
- User management: view all registered users, toggle active/inactive access, and delete accounts.
- Master quiz catalog: inspect and delete any quiz across departments.
- Platform results ledger: audit student attempts, scores, and completion statuses.

### 👨‍🏫 Teacher / Faculty
- Manage personal authored quizzes with full CRUD operations.
- Enter title, description, subject, duration (minutes), passing marks, schedule dates, shuffle options, and immediate result disclosure.
- Dynamic Question Builder: add multiple-choice questions with 4 options each, select exactly one correct answer, and assign custom marks.
- Live summary: automated calculation of total marks from question weights.
- Draft vs. Published toggle: validation ensures only complete quizzes (minimum 1 question, 4 options, 1 correct answer) can be published.
- Student examination preview modal.
- Track student scores, pass rates, and individual attempt breakdowns.

### 🎓 Student
- Browse open, published quizzes with subject filters and keyword search.
- View examination instructions, time limits, and syllabus before starting.
- Take timed exams with live countdown timer and question palette navigation.
- Real-time autosave on option selection and ability to clear selections.
- Confirmation dialog displaying answered vs. unanswered counts before manual submission.
- Automated system submission upon timer expiration.
- Detailed question-by-question post-exam performance review (if enabled by teacher).
- Comprehensive personal attempt history and academic profile.

---

## 4. Default Testing Accounts

The database seed script provides standard accounts for development and testing:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@quizplatform.edu` | `Admin@1234` |
| **Teacher** | Prof. Alan Turing | `teacher1@quizplatform.edu` | `Teacher@1234` |
| **Teacher** | Dr. Ada Lovelace | `teacher2@quizplatform.edu` | `Teacher@1234` |
| **Student** | John Doe | `student1@quizplatform.edu` | `Student@1234` |
| **Student** | Jane Smith | `student2@quizplatform.edu` | `Student@1234` |
| **Student** | Alex Johnson | `student3@quizplatform.edu` | `Student@1234` |

---

## 5. Directory Structure

```
online-quiz-platform/
├── prisma/
│   ├── schema.prisma            # Normalized database schema & relations
│   ├── seed.ts                  # Seeding script with demo users, quizzes, attempts
│   └── migrations/
│       └── 0_init/
│           └── migration.sql    # Complete SQL migration script
├── src/
│   ├── actions/                 # Next.js Server Actions (mutations & security checks)
│   │   ├── admin.ts             # User status toggle, deletions
│   │   ├── attempts.ts          # Exam start, autosave, submission, auto-timeout
│   │   ├── auth.ts              # Login, register, logout
│   │   ├── questions.ts         # MCQ creation, updates, and total marks calculation
│   │   └── quizzes.ts           # Quiz CRUD, publish validations
│   ├── app/                     # App Router routes and pages
│   │   ├── (auth)/login/        # User authentication sign-in page
│   │   ├── (auth)/register/     # Student & Teacher registration
│   │   ├── admin/               # Admin routes: dashboard, users, quizzes, results
│   │   ├── teacher/             # Teacher routes: dashboard, quizzes, create, edit, questions, results
│   │   ├── student/             # Student routes: dashboard, quizzes, attempts, results, history
│   │   ├── unauthorized/        # 403 Access Denied page
│   │   ├── not-found.tsx        # 404 Not Found page
│   │   ├── globals.css          # Theme tokens & Tailwind utility layers
│   │   ├── layout.tsx           # Root layout with ToastProvider
│   │   └── page.tsx             # Public landing page with feature showcase
│   ├── components/
│   │   ├── admin/               # Admin management client components
│   │   ├── dashboard/           # Recharts analytical visualizations
│   │   ├── navigation/          # Navbar, DashboardSidebar, DashboardHeader, LogoutButton
│   │   ├── student/             # QuizTakingInterface, StudentQuizBrowser, QuizDetailClient
│   │   ├── teacher/             # QuestionBuilder, QuizForm, TeacherQuizList
│   │   └── ui/                  # Button, Input, Textarea, Card, Badge, Dialog, Toast, Alert
│   ├── lib/
│   │   ├── auth.ts              # bcrypt hashing, JOSE JWT signing, cookie sessions
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── scoring.ts           # Server scoring engine & expiration calculation
│   │   ├── utils.ts             # Tailwind class merge and formatters
│   │   └── validations/         # Zod validation schemas
│   ├── middleware.ts            # Route protection & role redirection
│   └── types/                   # Shared TypeScript interfaces
├── .env.example                 # Example environment variables
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript compiler configuration
└── vitest.config.ts             # Vitest configuration
```

---

## 6. Neon Serverless PostgreSQL Setup

### Step 1: Create a Neon Database
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project (e.g. `quiz-platform`).
3. Neon will display your database connection details on the dashboard:
   - **Pooled connection string** (ends with `-pooler`): used for queries in `DATABASE_URL`.
   - **Direct connection string** (without `-pooler`): used for migrations in `DIRECT_URL`.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Neon connection credentials:
```env
# Neon Serverless PostgreSQL Pooled URL (for application queries)
DATABASE_URL="postgresql://username:password@ep-cool-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Neon Direct URL (for migrations and schema push)
DIRECT_URL="postgresql://username:password@ep-cool-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Secret key for JWT session encryption (32+ characters)
JWT_SECRET="super-secret-jwt-key-minimum-32-characters-long-example"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 7. Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Apply Migrations to Neon PostgreSQL
Apply the tracked migrations to your database:
```bash
npx prisma migrate deploy
```
*(Or for local development: `npx prisma db push`)*

### 4. Seed Database with Sample Data
Run the seeding script to create demo users, quizzes with questions, and completed attempts:
```bash
npm run prisma:seed
# or:
npx prisma db seed
```

### 5. Run Vitest Test Suite
Execute the 17 automated tests for scoring, time expiration, Zod validation, and password/JWT cryptography:
```bash
npm test
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build
Verify the production build:
```bash
npm run build
npm start
```

---

## 8. Deployment Instructions

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. In the project settings, configure the **Environment Variables**:
   - `DATABASE_URL`: Your pooled Neon PostgreSQL URL.
   - `DIRECT_URL`: Your direct Neon PostgreSQL URL.
   - `JWT_SECRET`: A secure 32+ character random secret string.
   - `NEXT_PUBLIC_APP_URL`: Your production domain URL.
4. Click **Deploy**. Vercel will build and deploy the Next.js App Router application.
5. In your local terminal, run the seed script pointing to production if initial demo accounts are desired:
   ```bash
   npx prisma db seed
   ```

---

## 9. Security & Academic Integrity Measures

1. **Server-Side Scoring Calculation:** All scoring is conducted by `src/lib/scoring.ts` inside a database transaction upon submission. Browser timers and submitted scores are never used.
2. **Hidden Correct Answers:** When a student queries an active quiz attempt, `select: { isCorrect: false }` ensures correct answers are physically omitted from the database response and never transmitted to the browser before submission.
3. **Double Submission & Concurrency Protection:** Active attempts are tracked in the database with status `IN_PROGRESS`. If a student attempts to restart an in-progress quiz, the existing attempt is resumed. Duplicate final submissions are idempotent.
4. **Authoritative Expiration:** The server computes `expiresAt = startedAt + durationMinutes`. Any mutation submitted after expiration triggers automatic finalized scoring with status `TIMED_OUT`.
5. **Ownership Isolation:** Teachers can only edit, add questions to, publish, or delete quizzes that belong to their own `teacherId`. Students can only access attempts linked to their own `studentId`.

---

## 10. License

Developed for academic assessment and higher education examination management.

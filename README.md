# Employee Profile Management System

A responsive, production-ready web application for managing employee profiles and personnel records. Designed for simple maintenance and expansion without paid cloud services or complex infrastructure.

---

## 📌 Project Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend API (Planned for Phase 2)**: Google Apps Script Web App
- **Database (Planned for Phase 2)**: Google Sheets (`Employees` sheet)
- **Version Control & Hosting**: GitHub + Free Static Hosting (GitHub Pages / Cloudflare Pages)

---

## 📁 Project Folder Structure

```
employee-profile-management/
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── LoginForm.tsx      # Login card with show/hide password and quick test buttons
│   │   ├── ProtectedRoute.tsx # Route guard requiring an active session
│   │   ├── AdminRoute.tsx     # Route guard enforcing Admin role permissions
│   │   ├── Header.tsx         # Top app navigation bar with user badge and logout
│   │   ├── Sidebar.tsx        # Collapsible responsive navigation for Admins
│   │   ├── EmployeeTable.tsx  # Responsive tabular employee listing with actions
│   │   ├── EmployeeProfileCard.tsx # Clean profile card with change-password dialog
│   │   ├── EmployeeFormModal.tsx   # Modal form for adding and editing employees
│   │   ├── LoadingSpinner.tsx # Accessible loading feedback component
│   │   ├── ErrorMessage.tsx   # Alert component for dismissible user error messages
│   │   └── ConfirmationDialog.tsx  # Modal confirmation dialog for critical actions
│   │
│   ├── pages/                 # Main application view pages
│   │   ├── LoginPage.tsx      # Authentication screen
│   │   ├── AdminDashboardPage.tsx  # Overview statistics cards and recent personnel
│   │   ├── AdminEmployeesPage.tsx  # Full directory with search and filter controls
│   │   └── EmployeeProfilePage.tsx # Restricted single-employee profile view
│   │
│   ├── services/
│   │   └── api.ts             # Abstracted API service (Mock for Phase 1; GAS for Phase 2)
│   │
│   ├── context/
│   │   └── AuthContext.tsx    # Session state, timeout handling, and role verification
│   │
│   ├── utils/
│   │   └── validation.ts      # Input validators for ID, Name, DOB, Phone, Password
│   │
│   ├── config.ts              # Central configuration file for API endpoints and settings
│   ├── types.ts               # Shared TypeScript data models and interfaces
│   ├── App.tsx                # Main application component and routing controller
│   ├── index.css              # Global styles and Tailwind configuration
│   └── main.tsx               # Application entry point
│
├── google-apps-script/
│   ├── Code.gs                # Google Apps Script Web App backend code template
│   └── README.md              # Spreadsheet setup and deployment walkthrough
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

---

## 🔑 Phase 1 Testing Accounts

The application includes mock authentication and a simulated personnel database for Phase 1 verification:

| Role | Employee ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADM001` | `admin123` | Full access to Dashboard, Directory, Add/Edit Employees |
| **Employee** | `EMP001` | `password123` | Restricted access to view only their own profile |
| **Employee** | `EMP002` | `password123` | Restricted access to view only their own profile |
| **Employee** | `EMP003` | `password123` | Restricted access to view only their own profile |

---

## 🗺️ Implementation Roadmap

- [x] **PHASE 1 (Completed)**: React/Vite project structure, responsive Login page, client-side routing, modular components, validation rules, role-based route protection, and abstracted mock API service.
- [x] **PHASE 2 (Completed)**: Google Sheets database structure, Google Apps Script Web App backend API (`Code.gs`), HMAC-signed session security, SHA-256 password encryption, role authorization on backend, and abstracted frontend API service.
- [ ] **PHASE 3 (Upcoming)**: Full live integration of Admin Dashboard with real-time Google Sheets synchronization.
- [ ] **PHASE 4 (Upcoming)**: Live integration of Employee Self-Service profile view.
- [ ] **PHASE 5 (Upcoming)**: Security hardening, SHA-256 password hashing in Apps Script, and session security audit.
- [ ] **PHASE 6 (Upcoming)**: Production deployment to GitHub and free static hosting.

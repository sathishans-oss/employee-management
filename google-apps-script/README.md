# 📋 Google Sheets & Google Apps Script Setup Guide (Phase 2)

This step-by-step walkthrough will help you set up your Google Sheets database and connect it to the **Employee Profile Management System**.

---

## 📑 Overview of Architecture

```
[ React Web Application ]
         │
         │  HTTP POST (JSON via Web App URL)
         ▼
[ Google Apps Script Web App (Code.gs) ]
         │
         │  Server-side Auth, Token Validation & Role Enforcement
         ▼
[ Google Sheet Database: "Employees" tab ]
```

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create a New Google Sheet
1. Open [Google Sheets](https://sheets.new) in your web browser.
2. At the top left, name your spreadsheet:
   ```
   Employee Profile Management System
   ```
3. Look at the tab name at the bottom left (default is `Sheet1`).
4. Right-click the tab, choose **Rename**, and name it exactly:
   ```
   Employees
   ```
   *(Note: This is case-sensitive and must be `Employees`)*

---

### Step 2: Configure the Table Columns

In Row 1 of your **`Employees`** sheet, add these 10 exact column headers:

| Column | Header Name | Description |
| :---: | :--- | :--- |
| **A** | `Employee ID` | Unique ID (e.g. `ADM001`, `EMP001`) |
| **B** | `Employee Name` | Full employee name (e.g. `John Doe`) |
| **C** | `Date of Birth` | Date format: `YYYY-MM-DD` (e.g. `1990-08-15`) |
| **D** | `Hobby` | Interests or hobbies (e.g. `Reading, Music`) |
| **E** | `Phone Number` | 10-digit contact number (e.g. `9876543210`) |
| **F** | `Password Hash` | SHA-256 password hash (salted) *(Never plain text in database)* |
| **G** | `Role` | Access permission: `ADMIN` or `EMPLOYEE` |
| **H** | `Status` | Account status: `ACTIVE` or `INACTIVE` |
| **I** | `Created At` | Record creation timestamp |
| **J** | `Updated At` | Record last modification timestamp |

---

### Step 3: Open Google Apps Script Editor
1. Inside your Google Sheet, click the top menu:
   **Extensions** ➔ **Apps Script**.
2. A new tab will open with the script editor.
3. Rename the project at the top from *Untitled project* to:
   ```
   Employee Profile Management API
   ```

---

### Step 4: Paste the Backend Code
1. In the Apps Script code editor, delete any existing placeholder code in `Code.gs`.
2. Open the file `google-apps-script/Code.gs` from this project.
3. Copy the entire contents of `Code.gs` and paste them into the Apps Script editor.
4. Click the **Save** icon (💾 or `Ctrl+S` / `Cmd+S`).

---

### Step 5: Initialize the First Admin Account (Safe 1-Click Setup)

To safely create the database headers and your initial administrator account without exposing passwords:

1. In the Apps Script toolbar, find the function dropdown (next to "Debug").
2. Select **`initialSetup`** from the dropdown.
3. Click the **▷ Run** button.
4. When prompted for permissions, click **Review permissions**, choose your Google account, and click **Allow**.
5. Once execution completes, switch back to your Google Sheet tab. You will see:
   - Formatted bold headers with background styling
   - **`ADM001`** (System Administrator, Role: `ADMIN`, Status: `ACTIVE`) with a salted SHA-256 hashed password (`admin123`)
   - **`EMP001`** (John Doe, Role: `EMPLOYEE`, Status: `ACTIVE`) with a salted SHA-256 hashed password (`password123`)

> ⚠️ **IMPORTANT — TEMPORARY TEST CREDENTIALS**:
> The accounts `ADM001 / admin123` and `EMP001 / password123` are **temporary setup credentials** generated solely for initial login.
> **Action Required**: Log in as `ADM001` immediately upon deployment, navigate to your Profile, and change the password using the "Change Password" dialog.

---

### Step 6: Deploy as a Web App

1. In the top-right corner of the Apps Script editor, click the blue **Deploy** button.
2. Select **New deployment**.
3. In the dialog, click the gear icon (⚙️) next to *Select type* and choose **Web app**.
4. Configure the deployment settings:
   - **Description**: `Employee API v2`
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: `Anyone` *(⚠️ Crucial: This allows the frontend to call the API without requiring end-users to have Google Workspace access)*
5. Click **Deploy**.
6. When prompted, click **Authorize access** and accept the permissions.
7. Copy the **Web app URL** that appears (the URL ends in `/exec`).
   *Example: `https://script.google.com/macros/s/AKfycbx.../exec`*

---

### Step 7: Connect the Frontend Application

1. In your project, open the file:
   ```
   src/config.ts
   ```
2. Paste your copied Web App URL into the `GOOGLE_APPS_SCRIPT_URL` variable:
   ```typescript
   export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Save the file. The React application will now automatically connect to your Google Sheets backend!

---

## 🔒 Security & Privacy Features

1. **Role-Based Server Authorization**:
   - The Apps Script backend verifies every request's session token and user role.
   - `EMPLOYEE` users can **only** read and edit their own profile (`EMP001` requesting `EMP002` receives an instant `ACCESS DENIED` response from the server).
   - `ADMIN` users are authorized to view and manage the full employee directory.

2. **Password Protection & Hashing**:
   - Passwords are securely hashed on the server using **salted SHA-256** combined with a server-side pepper stored exclusively in `PropertiesService`.
   - Passwords and password hashes are **never** returned in API responses.
   - Passwords are **never** stored in browser storage (`localStorage` stores only the session token and user profile display info).

3. **Tamper-Proof Session Tokens**:
   - Session tokens are signed using HMAC-SHA256 with a unique server secret key stored in Google Apps Script `PropertiesService` to prevent forged requests.

4. **Date of Birth (DOB) Identity Verification & Password Reset**:
   - **Backend-Only Verification**: Verification is performed directly on the Google Apps Script backend. The employee's stored Date of Birth and account existence are never revealed to the frontend on mismatch (returns generic error: `"Employee ID or Date of Birth is incorrect."`).
   - **Rate Limiting Protection**: Protects against brute-force verification attacks by rate-limiting failed DOB verification attempts.
   - **Cryptographic Reset Authorization**: Upon successful DOB match, the server generates an HMAC-signed reset token with a strict 10-minute validity window.
   - **Atomic Concurrency Protection & Single-Use Enforcement**:
     - `LockService.getScriptLock()` provides concurrency protection ensuring atomic check-and-consume behavior during simultaneous reset requests with a bounded 10-second timeout.
     - `PropertiesService` provides persistent consumed-token state storage across distributed Apps Script execution instances.
     - `CacheService` is used only as a supplementary fast-access cache layer (not as a lock).
     - Once consumed to reset the password, the token is permanently invalidated in persistent storage to prevent replay attacks and race conditions.
   - **Salted SHA-256 Hashing**: New passwords are cryptographically hashed on the backend with a unique salt and server-side pepper before being stored in the `Employees` sheet.



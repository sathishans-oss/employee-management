/**
 * =========================================================================
 * APPLICATION CONFIGURATION (PHASE 2: GOOGLE SHEETS BACKEND)
 * =========================================================================
 * 
 * 👉 FOR NON-PROGRAMMERS:
 * 1. Deploy your Google Apps Script as a Web App (instructions in google-apps-script/README.md)
 * 2. Copy the published Web App URL (ends with "/exec")
 * 3. Paste the URL into the GOOGLE_APPS_SCRIPT_URL setting below:
 */

// ⬇️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬇️
export const GOOGLE_APPS_SCRIPT_URL = 
  ((import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL as string) || 
  'https://script.google.com/macros/s/AKfycbzxS4q-MuhU-_-zrLA1QmQ639bqZwSYhzEoK7V90RhBW21Iq63I6QR-rXqAllr_KsFo7w/exec'; 
  // e.g. "https://script.google.com/macros/s/AKfycbx.../exec"


export const APP_CONFIG = {
  // Application details
  APP_NAME: 'Employee Profile Management System',
  VERSION: '2.0.0 (Phase 2)',
  
  // Google Apps Script Web App Deployment URL
  GOOGLE_APPS_SCRIPT_WEBAPP_URL: GOOGLE_APPS_SCRIPT_URL,
  
  // When false, all requests communicate directly with your Google Apps Script & Google Sheets database.
  // When true, uses local mock testing data for quick offline UI verification.
  // USE_MOCK_API: GOOGLE_APPS_SCRIPT_URL ? false : true,
   USE_MOCK_API: false,
  
  // Session timeout duration in minutes
  SESSION_TIMEOUT_MINUTES: 60,
  
  // Browser Storage Keys (Stores ONLY user ID, name, role, token. NEVER stores passwords)
  STORAGE_KEYS: {
    AUTH_USER: 'emp_mgmt_auth_user',
    MOCK_EMPLOYEES_DB: 'emp_mgmt_mock_db_v2',
  },
};


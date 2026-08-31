/**
 * Input validation helpers for Employee Profile Management System
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Employee ID (required, non-empty, trimmed)
 */
export function validateEmployeeId(employeeId: string): ValidationResult {
  const trimmed = employeeId?.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Employee ID is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Employee ID must be at least 3 characters.' };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Employee ID can only contain letters, numbers, hyphens, and underscores.' };
  }
  return { isValid: true };
}

/**
 * Validates Employee Name (required, trimmed, letters and spaces)
 */
export function validateEmployeeName(name: string): ValidationResult {
  const trimmed = name?.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Employee Name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Employee Name must be at least 2 characters long.' };
  }
  return { isValid: true };
}

/**
 * Validates Date of Birth (required, valid calendar date strictly in the past)
 */
export function validateDateOfBirth(dob: string): ValidationResult {
  if (!dob || !dob.trim()) {
    return { isValid: false, error: 'Date of Birth is required.' };
  }

  const normalized = normalizeDob(dob);
  if (!normalized) {
    return { isValid: false, error: 'Please enter a valid calendar Date of Birth.' };
  }

  const parts = normalized.split('-');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Please enter a valid Date of Birth.' };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    return { isValid: false, error: 'Date of Birth must be in the past.' };
  }

  // Check reasonable age (at least 16 years old and under 100)
  const ageInYears = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ageInYears < 16) {
    return { isValid: false, error: 'Employee must be at least 16 years of age.' };
  }
  if (ageInYears > 100) {
    return { isValid: false, error: 'Please check the year in Date of Birth.' };
  }

  return { isValid: true };
}

/**
 * Validates Phone Number (optional, but if present must be reasonable 10-digit or international format)
 */
export function validatePhoneNumber(phone?: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // optional field
  }
  
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches 10-digit Indian phone or standard 10-13 digit international phone numbers
  if (!/^\+?[0-9]{10,13}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number (e.g. 9876543210).' };
  }
  
  return { isValid: true };
}

/**
 * Validates Password (required for creation, min 6 characters)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  return { isValid: true };
}

/**
 * Formats date string to DD/MM/YYYY for presentation
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes and validates any date representation (ISO, YYYY-MM-DD, DD/MM/YYYY, etc.) to canonical YYYY-MM-DD.
 * Strictly verifies calendar days (e.g. rejects 31/02/2020 or non-leap Feb 29).
 */
export function normalizeDob(val?: string | Date): string {
  if (!val) return '';

  let year = 0;
  let month = 0;
  let day = 0;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    year = val.getFullYear();
    month = val.getMonth() + 1;
    day = val.getDate();
  } else {
    let str = val.toString().trim();
    if (str.includes('T')) {
      str = str.split('T')[0];
    }

    // Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10);
      day = parseInt(isoMatch[3], 10);
    } else {
      // Check DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
      const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmyMatch) {
        day = parseInt(dmyMatch[1], 10);
        month = parseInt(dmyMatch[2], 10);
        year = parseInt(dmyMatch[3], 10);
      } else {
        // Fallback to Date parsing
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          year = parsed.getFullYear();
          month = parsed.getMonth() + 1;
          day = parsed.getDate();
        } else {
          return '';
        }
      }
    }
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return '';
  }

  // Exact calendar validation to reject non-existent calendar dates like 31/02/2020
  const calendarCheck = new Date(year, month - 1, day);
  if (
    calendarCheck.getFullYear() !== year ||
    calendarCheck.getMonth() !== (month - 1) ||
    calendarCheck.getDate() !== day
  ) {
    return ''; // Invalid calendar date
  }

  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


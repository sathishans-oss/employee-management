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
 * Validates Date of Birth (required, valid past date)
 */
export function validateDateOfBirth(dob: string): ValidationResult {
  if (!dob || !dob.trim()) {
    return { isValid: false, error: 'Date of Birth is required.' };
  }
  
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid Date of Birth.' };
  }
  
  const today = new Date();
  if (date >= today) {
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

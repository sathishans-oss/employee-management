/**
 * GOOGLE APPS SCRIPT BACKEND API
 * 
 * Project: Employee Profile Management System
 * Phase: Phase 2 Backend Implementation
 * 
 * Database: Google Sheets (Spreadsheet with sheet named "Employees")
 * 
 * Sheet Columns:
 * A: Employee ID
 * B: Employee Name
 * C: Date of Birth
 * D: Hobby
 * E: Phone Number
 * F: Password Hash (SHA-256)
 * G: Role (ADMIN / EMPLOYEE)
 * H: Status (ACTIVE / INACTIVE)
 * I: Created At
 * J: Updated At
 */

// Target Sheet Tab Name
var SHEET_NAME = 'Employees';

// Secret key for HMAC session token signing (stored securely in Script Properties)
function getSecretKey() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('AUTH_SECRET_KEY');
  if (!secret) {
    secret = Utilities.getUuid() + '-' + Utilities.getUuid();
    props.setProperty('AUTH_SECRET_KEY', secret);
  }
  return secret;
}

// Server-side pepper for password hashing (stored securely in Script Properties)
function getPasswordPepper() {
  var props = PropertiesService.getScriptProperties();
  var pepper = props.getProperty('PASSWORD_PEPPER');
  if (!pepper) {
    pepper = Utilities.getUuid() + '-' + Utilities.getUuid();
    props.setProperty('PASSWORD_PEPPER', pepper);
  }
  return pepper;
}

/**
 * Handle HTTP POST requests from React Frontend
 */
function doPost(e) {
  try {
    var params = {};

    // Support JSON payload body or URL-encoded form parameters
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    var action = params.action;
    var result = { success: false, error: 'Invalid or missing action parameter.' };

    switch (action) {
      case 'login':
        result = handleLogin(params.employeeId, params.password);
        break;

      case 'getEmployee':
        result = handleGetEmployee(params.employeeId, params.sessionToken);
        break;

      case 'getAllEmployees':
        result = handleGetAllEmployees(params.sessionToken);
        break;

      case 'addEmployee':
        result = handleAddEmployee(params, params.sessionToken);
        break;

      case 'updateEmployee':
        result = handleUpdateEmployee(params, params.sessionToken);
        break;

      case 'changePassword':
        result = handleChangePassword(params.employeeId, params.newPassword, params.sessionToken);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Backend execution error: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP GET requests (Health check / verification)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Employee Profile Management System API is live.',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================

function handleLogin(employeeId, password) {
  if (!employeeId || !password) {
    return { success: false, error: 'Employee ID and password are required.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var cleanId = employeeId.toString().trim().toUpperCase();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmpId = (row[0] || '').toString().trim().toUpperCase();
    var rowName = (row[1] || '').toString();
    var rowPassHash = (row[5] || '').toString().trim();
    var rowRole = (row[6] || 'EMPLOYEE').toString().trim().toUpperCase();
    var rowStatus = (row[7] || 'ACTIVE').toString().trim().toUpperCase();

    if (rowEmpId === cleanId) {
      // Check account status
      if (rowStatus !== 'ACTIVE') {
        return { success: false, error: 'Your account is inactive. Please contact the administrator.' };
      }

      // Verify password against salted hash (or legacy upgrade check)
      if (verifyPassword(password, rowPassHash)) {
        // Auto-upgrade legacy unsalted hash or plaintext to salted SHA-256
        if (rowPassHash.indexOf(':') === -1) {
          var upgradedHash = hashPassword(password);
          sheet.getRange(i + 1, 6).setValue(upgradedHash);
          sheet.getRange(i + 1, 10).setValue(new Date().toISOString());
        }

        var token = generateSessionToken(rowEmpId, rowRole);

        return {
          success: true,
          message: 'Login successful',
          data: {
            employeeId: rowEmpId,
            employeeName: rowName,
            role: rowRole,
            token: token,
            loginTime: Date.now()
          }
        };
      } else {
        return { success: false, error: 'Invalid Employee ID or password.' };
      }
    }
  }

  return { success: false, error: 'Invalid Employee ID or password.' };
}

// ==========================================
// 2. GET SINGLE EMPLOYEE PROFILE
// ==========================================

function handleGetEmployee(employeeId, sessionToken) {
  var auth = verifySessionToken(sessionToken);
  if (!auth.valid) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  if (!employeeId) {
    return { success: false, error: 'Employee ID is required.' };
  }

  var targetId = employeeId.toString().trim().toUpperCase();

  // STRICT AUTHORIZATION CHECK:
  // EMPLOYEE role can ONLY access their own profile record.
  // Attempts by EMP001 to view EMP002 must be strictly denied.
  if (auth.role === 'EMPLOYEE' && auth.employeeId !== targetId) {
    return { success: false, error: 'You are not authorized to access this information.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmpId = (row[0] || '').toString().trim().toUpperCase();

    if (rowEmpId === targetId) {
      return {
        success: true,
        data: {
          employeeId: (row[0] || '').toString(),
          employeeName: (row[1] || '').toString(),
          dateOfBirth: formatDate(row[2]),
          hobby: (row[3] || '').toString(),
          phoneNumber: (row[4] || '').toString(),
          // NEVER return column F (password hash)
          role: (row[6] || 'EMPLOYEE').toString(),
          status: (row[7] || 'ACTIVE').toString(),
          createdAt: formatDate(row[8]),
          updatedAt: formatDate(row[9])
        }
      };
    }
  }

  return { success: false, error: 'Employee not found.' };
}

// ==========================================
// 3. GET ALL EMPLOYEES (ADMIN ONLY)
// ==========================================

function handleGetAllEmployees(sessionToken) {
  var auth = verifySessionToken(sessionToken);
  if (!auth.valid || auth.role !== 'ADMIN') {
    return { success: false, error: 'You are not authorized to access the complete employee database.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var employees = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmpId = (row[0] || '').toString().trim();
    if (!rowEmpId) continue; // skip empty rows

    employees.push({
      employeeId: rowEmpId,
      employeeName: (row[1] || '').toString(),
      dateOfBirth: formatDate(row[2]),
      hobby: (row[3] || '').toString(),
      phoneNumber: (row[4] || '').toString(),
      // NEVER return column F (password hash)
      role: (row[6] || 'EMPLOYEE').toString(),
      status: (row[7] || 'ACTIVE').toString(),
      createdAt: formatDate(row[8]),
      updatedAt: formatDate(row[9])
    });
  }

  return { success: true, data: employees };
}

// ==========================================
// 4. ADD EMPLOYEE (ADMIN ONLY)
// ==========================================

function handleAddEmployee(params, sessionToken) {
  var auth = verifySessionToken(sessionToken);
  if (!auth.valid || auth.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  var cleanId = (params.employeeId || '').toString().trim().toUpperCase();
  var cleanName = (params.employeeName || '').toString().trim();
  var dob = (params.dateOfBirth || '').toString().trim();
  var password = (params.password || '').toString();

  // Validate required fields
  if (!cleanId || !cleanName || !dob || !password) {
    return { success: false, error: 'Employee ID, Name, Date of Birth, and Password are required.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();

  // Check unique ID
  for (var i = 1; i < data.length; i++) {
    var existingId = (data[i][0] || '').toString().trim().toUpperCase();
    if (existingId === cleanId) {
      return { success: false, error: 'Employee ID "' + cleanId + '" already exists. Please use a unique ID.' };
    }
  }

  var now = new Date().toISOString();
  var passHash = hashPassword(password);
  var role = (params.role === 'ADMIN') ? 'ADMIN' : 'EMPLOYEE';
  var status = (params.status === 'INACTIVE') ? 'INACTIVE' : 'ACTIVE';
  var hobby = (params.hobby || '').toString().trim();
  var phone = (params.phoneNumber || '').toString().trim();

  sheet.appendRow([
    cleanId,
    cleanName,
    dob,
    hobby,
    phone,
    passHash,
    role,
    status,
    now,
    now
  ]);

  return {
    success: true,
    message: 'Employee added successfully.',
    data: {
      employeeId: cleanId,
      employeeName: cleanName,
      dateOfBirth: dob,
      hobby: hobby,
      phoneNumber: phone,
      role: role,
      status: status,
      createdAt: now,
      updatedAt: now
    }
  };
}

// ==========================================
// 5. UPDATE EMPLOYEE (ADMIN ONLY)
// ==========================================

function handleUpdateEmployee(params, sessionToken) {
  var auth = verifySessionToken(sessionToken);
  if (!auth.valid || auth.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  var targetId = (params.employeeId || '').toString().trim().toUpperCase();
  if (!targetId) {
    return { success: false, error: 'Employee ID is required.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().trim().toUpperCase() === targetId) {
      rowIndex = i + 1; // 1-indexed for Sheets
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, error: 'Employee not found.' };
  }

  var now = new Date().toISOString();

  if (params.employeeName !== undefined && params.employeeName !== '') {
    sheet.getRange(rowIndex, 2).setValue(params.employeeName.toString().trim());
  }
  if (params.dateOfBirth !== undefined && params.dateOfBirth !== '') {
    sheet.getRange(rowIndex, 3).setValue(params.dateOfBirth.toString().trim());
  }
  if (params.hobby !== undefined) {
    sheet.getRange(rowIndex, 4).setValue(params.hobby.toString().trim());
  }
  if (params.phoneNumber !== undefined) {
    sheet.getRange(rowIndex, 5).setValue(params.phoneNumber.toString().trim());
  }
  if (params.role !== undefined) {
    sheet.getRange(rowIndex, 7).setValue(params.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE');
  }
  if (params.status !== undefined) {
    sheet.getRange(rowIndex, 8).setValue(params.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
  }

  // Update Updated At timestamp
  sheet.getRange(rowIndex, 10).setValue(now);

  return {
    success: true,
    message: 'Employee updated successfully.',
    data: {
      employeeId: targetId,
      employeeName: sheet.getRange(rowIndex, 2).getValue().toString(),
      dateOfBirth: formatDate(sheet.getRange(rowIndex, 3).getValue()),
      hobby: sheet.getRange(rowIndex, 4).getValue().toString(),
      phoneNumber: sheet.getRange(rowIndex, 5).getValue().toString(),
      role: sheet.getRange(rowIndex, 7).getValue().toString(),
      status: sheet.getRange(rowIndex, 8).getValue().toString(),
      updatedAt: now
    }
  };
}

// ==========================================
// 6. CHANGE PASSWORD
// ==========================================

function handleChangePassword(employeeId, newPassword, sessionToken) {
  var auth = verifySessionToken(sessionToken);
  if (!auth.valid) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  if (!employeeId || !newPassword) {
    return { success: false, error: 'Employee ID and new password are required.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  var targetId = employeeId.toString().trim().toUpperCase();

  // Permission Check: EMPLOYEE can only change their own password
  if (auth.role !== 'ADMIN' && auth.employeeId !== targetId) {
    return { success: false, error: 'You are not authorized to change another user\'s password.' };
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().trim().toUpperCase() === targetId) {
      var newPassHash = hashPassword(newPassword);
      sheet.getRange(i + 1, 6).setValue(newPassHash);
      sheet.getRange(i + 1, 10).setValue(new Date().toISOString());
      return { success: true, message: 'Password updated successfully.' };
    }
  }

  return { success: false, error: 'Employee not found.' };
}

// ==========================================
// 7. INITIAL SETUP FUNCTION (RUN ONCE FROM APPS SCRIPT)
// ==========================================

/**
 * Run this function directly inside the Apps Script Editor (Click Run -> initialSetup)
 * to automatically prepare the Google Sheet headers and create the first initial ADMIN account.
 */
function initialSetup() {
  var sheet = getOrCreateSheet();
  
  // Set headers
  var headers = [
    'Employee ID',
    'Employee Name',
    'Date of Birth',
    'Hobby',
    'Phone Number',
    'Password Hash',
    'Role',
    'Status',
    'Created At',
    'Updated At'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#F1F5F9');
  sheet.setFrozenRows(1);

  // Check if ADMIN already exists
  var data = sheet.getDataRange().getValues();
  var adminFound = false;

  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().trim().toUpperCase() === 'ADM001') {
      adminFound = true;
      break;
    }
  }

  if (!adminFound) {
    var now = new Date().toISOString();
    
    // Seed TEMPORARY setup Admin account: ADM001 / admin123
    sheet.appendRow([
      'ADM001',
      'System Administrator',
      '1985-04-12',
      'Technology, Chess',
      '9876500001',
      hashPassword('admin123'),
      'ADMIN',
      'ACTIVE',
      now,
      now
    ]);

    // Seed TEMPORARY setup Employee account: EMP001 / password123
    sheet.appendRow([
      'EMP001',
      'John Doe',
      '1990-08-15',
      'Reading, Photography',
      '9876543210',
      hashPassword('password123'),
      'EMPLOYEE',
      'ACTIVE',
      now,
      now
    ]);

    Logger.log('⚠️ SETUP COMPLETED: Initial TEMPORARY accounts created (ADM001 / admin123 & EMP001 / password123).');
    Logger.log('🔒 ACTION REQUIRED: Please log in as ADM001 and change your password immediately after first login.');
  } else {
    Logger.log('Headers verified. Admin account ADM001 already exists.');
  }
}

// ==========================================
// 8. SECURITY & UTILITY HELPERS
// ==========================================

/**
 * Computes a Salted SHA-256 password hash combined with a server-side pepper
 * Format returned: "salt:hash"
 */
function hashPassword(password, customSalt) {
  var salt = customSalt || Utilities.getUuid().replace(/-/g, '').substring(0, 16);
  var pepper = getPasswordPepper();
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + password.toString() + ':' + pepper,
    Utilities.Charset.UTF_8
  );
  var hex = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return salt + ':' + hex;
}

/**
 * Verifies a password against stored hash (supporting salted SHA-256 and legacy unsalted migration)
 * STRICT: Plain text passwords in Column F are strictly rejected.
 */
function verifyPassword(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) return false;
  var strStored = storedHash.toString().trim();

  // Salted format check: "salt:hash"
  if (strStored.indexOf(':') !== -1) {
    var parts = strStored.split(':');
    var salt = parts[0];
    var computed = hashPassword(inputPassword, salt);
    return computed === strStored;
  }

  // Temporary fallback for legacy unsalted 64-character hex SHA-256
  if (/^[a-fA-F0-9]{64}$/.test(strStored)) {
    var legacyHash = computeLegacySha256(inputPassword);
    return legacyHash.toLowerCase() === strStored.toLowerCase();
  }

  // Strictly reject plaintext or invalid hash values
  return false;
}

/**
 * Legacy plain SHA-256 digest computation (for migration support)
 */
function computeLegacySha256(val) {
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    val.toString(),
    Utilities.Charset.UTF_8
  );
  var hex = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return hex;
}

/**
 * Generates an HMAC-signed session token
 */
function generateSessionToken(employeeId, role) {
  var timestamp = Date.now().toString();
  var payload = employeeId + '|' + role + '|' + timestamp;
  var signature = Utilities.computeHmacSha256Signature(payload, getSecretKey());
  var sigHex = signature.map(function(byte) {
    var b = (byte < 0 ? byte + 256 : byte).toString(16);
    return b.length === 1 ? '0' + b : b;
  }).join('');

  var rawToken = payload + '|' + sigHex;
  return Utilities.base64Encode(rawToken);
}

/**
 * Verifies an HMAC-signed session token and validates against the current Employees sheet.
 * Rejects unsigned, legacy, expired, tampered, or inactive employee tokens.
 */
function verifySessionToken(token) {
  if (!token) return { valid: false };
  try {
    var decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    var parts = decoded.split('|');
    if (parts.length !== 4) {
      return { valid: false };
    }

    var employeeId = (parts[0] || '').toString().trim().toUpperCase();
    var role = (parts[1] || '').toString().trim().toUpperCase();
    var timestampStr = parts[2];
    var timestamp = parseInt(timestampStr, 10);
    var providedSig = parts[3];

    if (!employeeId || !role || isNaN(timestamp) || !providedSig) {
      return { valid: false };
    }

    // Check token age (24 hours expiration) and future drift (> 1 minute)
    var maxAgeMs = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 60000) {
      return { valid: false };
    }

    var payload = parts[0] + '|' + parts[1] + '|' + parts[2];
    var expectedSigBytes = Utilities.computeHmacSha256Signature(payload, getSecretKey());
    var expectedSig = expectedSigBytes.map(function(byte) {
      var b = (byte < 0 ? byte + 256 : byte).toString(16);
      return b.length === 1 ? '0' + b : b;
    }).join('');

    if (providedSig !== expectedSig) {
      return { valid: false };
    }

    // Validate employee record directly against the current Google Sheet:
    // 1. Employee must still exist
    // 2. Employee must still have the same role
    // 3. Employee status must be ACTIVE
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();
    var employeeFound = false;
    var currentRole = '';
    var currentStatus = '';

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmpId = (row[0] || '').toString().trim().toUpperCase();
      if (rowEmpId === employeeId) {
        employeeFound = true;
        currentRole = (row[6] || 'EMPLOYEE').toString().trim().toUpperCase();
        currentStatus = (row[7] || 'ACTIVE').toString().trim().toUpperCase();
        break;
      }
    }

    if (!employeeFound || currentStatus !== 'ACTIVE' || currentRole !== role) {
      return { valid: false };
    }

    return {
      valid: true,
      employeeId: employeeId,
      role: currentRole
    };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Helper to retrieve or create the 'Employees' sheet tab
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers automatically
    var headers = [
      'Employee ID',
      'Employee Name',
      'Date of Birth',
      'Hobby',
      'Phone Number',
      'Password Hash',
      'Role',
      'Status',
      'Created At',
      'Updated At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#F1F5F9');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Format Date objects to ISO string or YYYY-MM-DD
 */
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'UTC', 'yyyy-MM-dd');
  }
  return val.toString();
}

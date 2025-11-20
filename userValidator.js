/**
 * User Validation Module
 * Provides validation functions for user data
 */

// Custom Error Classes for User Validation
/**
 * Base error class for user validation
 */
class UserValidationError extends Error {
  constructor(message, code, field = null, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.field = field;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a required field is missing
 */
class RequiredFieldError extends UserValidationError {
  constructor(fieldName) {
    super(
      `Required field "${fieldName}" is missing or empty`,
      'REQUIRED_FIELD',
      fieldName,
      { fieldName }
    );
  }
}

/**
 * Error thrown when an email is invalid
 */
class InvalidEmailError extends UserValidationError {
  constructor(email, reason) {
    const message = reason 
      ? `Invalid email format for "${email}": ${reason}`
      : `Invalid email format: ${email}`;
    super(
      message,
      'INVALID_EMAIL',
      'email',
      { email, reason }
    );
  }
}

/**
 * Error thrown when a value is not a valid number
 */
class InvalidAgeError extends UserValidationError {
  constructor(age, minAge = 0, maxAge = 150, reason = null) {
    let message;
    
    if (reason) {
      message = reason;
    } else if (typeof age !== 'number') {
      message = `Age must be a number, but received ${typeof age}`;
    } else if (!Number.isInteger(age)) {
      message = `Age must be a whole number (integer), but received ${age}`;
    } else if (age < minAge) {
      message = `Age (${age}) is too low. Minimum allowed age is ${minAge}`;
    } else if (age > maxAge) {
      message = `Age (${age}) is too high. Maximum allowed age is ${maxAge}`;
    } else {
      message = `Invalid age: ${age}. Age must be between ${minAge} and ${maxAge}`;
    }
    
    super(
      message,
      'INVALID_AGE',
      'age',
      { age, minAge, maxAge }
    );
  }
}

/**
 * Error thrown when a string length is invalid
 */
class InvalidLengthError extends UserValidationError {
  constructor(fieldName, value, minLength, maxLength, reason = null) {
    const actualLength = value.length;
    let message;
    
    if (reason) {
      message = reason;
    } else if (actualLength < minLength) {
      message = `Field "${fieldName}" is too short (${actualLength} characters). Minimum required: ${minLength} ${minLength === 1 ? 'character' : 'characters'}`;
    } else if (actualLength > maxLength) {
      message = `Field "${fieldName}" is too long (${actualLength} characters). Maximum allowed: ${maxLength} ${maxLength === 1 ? 'character' : 'characters'}`;
    } else {
      message = `Invalid length for "${fieldName}": ${actualLength} characters. Must be between ${minLength} and ${maxLength} characters`;
    }
    
    super(
      message,
      'INVALID_LENGTH',
      fieldName,
      { value, minLength, maxLength, actualLength }
    );
  }
}

/**
 * Error thrown when a password doesn't meet requirements
 */
class InvalidPasswordError extends UserValidationError {
  constructor(reason) {
    super(
      `Invalid password: ${reason}`,
      'INVALID_PASSWORD',
      'password',
      { reason }
    );
  }
}

// Validation helper functions
/**
 * Validates that a value exists and is not empty
 * @param {*} value - The value to validate
 * @param {string} fieldName - The field name for error messages
 * @throws {RequiredFieldError} If value is missing or empty
 */
const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    throw new RequiredFieldError(fieldName);
  }
};

/**
 * Validates that a string has a valid length
 * @param {string} value - The string to validate
 * @param {string} fieldName - The field name for error messages
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @throws {InvalidLengthError} If length is invalid
 */
const validateLength = (value, fieldName, minLength = 1, maxLength = 255) => {
  if (typeof value !== 'string') {
    throw new UserValidationError(
      `Field "${fieldName}" must be a string, but received ${typeof value}`,
      'INVALID_TYPE',
      fieldName,
      { value, expectedType: 'string', receivedType: typeof value }
    );
  }
  
  if (value.length < minLength) {
    throw new InvalidLengthError(
      fieldName, 
      value, 
      minLength, 
      maxLength
    );
  }
  
  if (value.length > maxLength) {
    throw new InvalidLengthError(
      fieldName, 
      value, 
      minLength, 
      maxLength
    );
  }
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxLength - Maximum email length (default: 254)
 * @param {boolean} options.allowPlusSign - Allow + sign in local part (default: true)
 * @throws {InvalidEmailError} If email format is invalid
 */
const validateEmail = (email, options = {}) => {
  const { maxLength = 254, allowPlusSign = true } = options;
  
  if (typeof email !== 'string') {
    throw new InvalidEmailError(email || 'undefined', 'Email must be a string value');
  }
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  
  // Check if empty after trimming
  if (!trimmedEmail) {
    throw new InvalidEmailError(email, 'Email cannot be empty');
  }
  
  // Check length (RFC 5321 limit)
  if (trimmedEmail.length > maxLength) {
    throw new InvalidEmailError(
      email, 
      `Email is too long (${trimmedEmail.length} characters). Maximum allowed length is ${maxLength} characters`
    );
  }
  
  // Split email into local and domain parts
  const parts = trimmedEmail.split('@');
  
  if (parts.length !== 2) {
    throw new InvalidEmailError(
      email, 
      parts.length === 0 
        ? 'Email must contain an @ symbol' 
        : 'Email cannot contain multiple @ symbols'
    );
  }
  
  const [localPart, domain] = parts;
  
  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    throw new InvalidEmailError(email, 'Email must have a local part (before the @ symbol)');
  }
  
  if (localPart.length > 64) {
    throw new InvalidEmailError(
      email, 
      `Local part (before @) is too long (${localPart.length} characters). Maximum allowed is 64 characters`
    );
  }
  
  // Local part cannot start or end with dot
  if (localPart.startsWith('.')) {
    throw new InvalidEmailError(email, 'Local part (before @) cannot start with a dot (.)');
  }
  
  if (localPart.endsWith('.')) {
    throw new InvalidEmailError(email, 'Local part (before @) cannot end with a dot (.)');
  }
  
  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    throw new InvalidEmailError(email, 'Local part (before @) cannot contain consecutive dots (..)');
  }
  
  // Validate local part characters
  const localPartRegex = allowPlusSign 
    ? /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/
    : /^[a-zA-Z0-9.!#$%&'*\/=?^_`{|}~-]+$/;
  
  if (!localPartRegex.test(localPart)) {
    const reason = allowPlusSign
      ? 'Local part (before @) contains invalid characters. Only letters, numbers, and these special characters are allowed: . ! # $ % & \' * + / = ? ^ _ ` { | } ~ -'
      : 'Local part (before @) contains invalid characters. Only letters, numbers, and these special characters are allowed: . ! # $ % & \' * / = ? ^ _ ` { | } ~ -';
    throw new InvalidEmailError(email, reason);
  }
  
  // Validate domain part (after @)
  if (!domain || domain.length === 0) {
    throw new InvalidEmailError(email, 'Email must have a domain part (after the @ symbol)');
  }
  
  if (domain.length > 253) {
    throw new InvalidEmailError(
      email, 
      `Domain part (after @) is too long (${domain.length} characters). Maximum allowed is 253 characters`
    );
  }
  
  // Domain cannot start or end with dot or hyphen
  if (domain.startsWith('.')) {
    throw new InvalidEmailError(email, 'Domain part (after @) cannot start with a dot (.)');
  }
  
  if (domain.endsWith('.')) {
    throw new InvalidEmailError(email, 'Domain part (after @) cannot end with a dot (.)');
  }
  
  if (domain.startsWith('-')) {
    throw new InvalidEmailError(email, 'Domain part (after @) cannot start with a hyphen (-)');
  }
  
  if (domain.endsWith('-')) {
    throw new InvalidEmailError(email, 'Domain part (after @) cannot end with a hyphen (-)');
  }
  
  // Domain must contain at least one dot
  if (!domain.includes('.')) {
    throw new InvalidEmailError(email, 'Domain part (after @) must contain at least one dot (.) to separate domain labels');
  }
  
  // Split domain into labels
  const domainLabels = domain.split('.');
  
  // Each label must be 1-63 characters
  for (let i = 0; i < domainLabels.length; i++) {
    const label = domainLabels[i];
    if (label.length === 0) {
      throw new InvalidEmailError(email, `Domain label ${i + 1} cannot be empty`);
    }
    
    if (label.length > 63) {
      throw new InvalidEmailError(
        email, 
        `Domain label "${label}" is too long (${label.length} characters). Maximum allowed is 63 characters per label`
      );
    }
    
    // Label can only contain letters, numbers, and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      throw new InvalidEmailError(
        email, 
        `Domain label "${label}" contains invalid characters. Only letters, numbers, and hyphens are allowed`
      );
    }
    
    // Label cannot start or end with hyphen
    if (label.startsWith('-')) {
      throw new InvalidEmailError(email, `Domain label "${label}" cannot start with a hyphen (-)`);
    }
    
    if (label.endsWith('-')) {
      throw new InvalidEmailError(email, `Domain label "${label}" cannot end with a hyphen (-)`);
    }
  }
  
  // Top-level domain must be at least 2 characters
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) {
    throw new InvalidEmailError(
      email, 
      `Top-level domain (${tld}) must be at least 2 characters long`
    );
  }
  
  if (!/^[a-zA-Z]+$/.test(tld)) {
    throw new InvalidEmailError(
      email, 
      `Top-level domain (${tld}) can only contain letters (a-z, A-Z)`
    );
  }
};

/**
 * Validates age is within valid range
 * @param {number} age - The age to validate
 * @param {number} minAge - Minimum age (default: 0)
 * @param {number} maxAge - Maximum age (default: 150)
 * @throws {InvalidAgeError} If age is invalid
 */
const validateAge = (age, minAge = 0, maxAge = 150) => {
  if (typeof age !== 'number') {
    throw new InvalidAgeError(age, minAge, maxAge, `Age must be a number, but received ${typeof age}`);
  }
  
  if (!Number.isInteger(age)) {
    throw new InvalidAgeError(age, minAge, maxAge, `Age must be a whole number (integer), but received ${age}`);
  }
  
  if (age < minAge) {
    throw new InvalidAgeError(age, minAge, maxAge, `Age (${age}) is too low. Minimum allowed age is ${minAge}`);
  }
  
  if (age > maxAge) {
    throw new InvalidAgeError(age, minAge, maxAge, `Age (${age}) is too high. Maximum allowed age is ${maxAge}`);
  }
};

/**
 * Common weak passwords that should be rejected
 */
const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'abc123', 'admin', 'letmein',
  'welcome', 'monkey', '1234567', 'password1', 'sunshine',
  'master', 'hello', 'freedom', 'whatever', 'trustno1'
];

/**
 * Checks if password contains sequential characters (e.g., "12345", "abcde")
 * @param {string} password - The password to check
 * @returns {boolean} True if sequential characters found
 */
const hasSequentialChars = (password) => {
  const sequences = [
    '0123456789',
    '9876543210',
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'ZYXWVUTSRQPONMLKJIHGFEDCBA'
  ];
  
  for (const seq of sequences) {
    for (let i = 0; i <= password.length - 3; i++) {
      const substr = password.slice(i, i + 3);
      if (seq.includes(substr)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Checks if password contains repetitive characters (e.g., "aaaaaa", "111111")
 * @param {string} password - The password to check
 * @param {number} maxRepeat - Maximum allowed consecutive repeats (default: 2)
 * @returns {boolean} True if too many repetitive characters found
 */
const hasRepetitiveChars = (password, maxRepeat = 2) => {
  let repeatCount = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      repeatCount++;
      if (repeatCount > maxRepeat) {
        return true;
      }
    } else {
      repeatCount = 1;
    }
  }
  return false;
};

/**
 * Calculates password strength score (0-100)
 * @param {string} password - The password to score
 * @returns {number} Strength score from 0 to 100
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length scoring (max 25 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 5;
  
  // Character variety scoring (max 40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  
  // Complexity scoring (max 20 points)
  const charVariety = new Set(password).size;
  score += Math.min(20, charVariety * 2);
  
  // Length bonus (max 15 points)
  score += Math.min(15, password.length);
  
  return Math.min(100, score);
};

/**
 * Validates password strength with comprehensive requirements
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @param {number} options.maxLength - Maximum length (default: 128)
 * @param {boolean} options.requireUppercase - Require uppercase letter (default: true)
 * @param {boolean} options.requireLowercase - Require lowercase letter (default: true)
 * @param {boolean} options.requireNumber - Require number (default: true)
 * @param {boolean} options.requireSpecialChar - Require special character (default: true)
 * @param {number} options.minStrength - Minimum strength score 0-100 (default: 50)
 * @param {boolean} options.rejectCommonPasswords - Reject common passwords (default: true)
 * @param {boolean} options.rejectSequential - Reject sequential chars (default: true)
 * @param {boolean} options.rejectRepetitive - Reject repetitive chars (default: true)
 * @param {number} options.maxRepeat - Max consecutive repeats if rejectRepetitive (default: 2)
 * @returns {Object} Validation result with strength score
 * @throws {InvalidPasswordError} If password doesn't meet requirements
 */
const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
    minStrength = 50,
    rejectCommonPasswords = true,
    rejectSequential = true,
    rejectRepetitive = true,
    maxRepeat = 2
  } = options;

  if (typeof password !== 'string') {
    throw new InvalidPasswordError('Password must be a string');
  }

  // Check minimum length
  if (password.length < minLength) {
    throw new InvalidPasswordError(
      `Password must be at least ${minLength} characters long (currently ${password.length})`
    );
  }

  // Check maximum length
  if (password.length > maxLength) {
    throw new InvalidPasswordError(
      `Password must be no more than ${maxLength} characters long (currently ${password.length})`
    );
  }

  // Check for common passwords
  if (rejectCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      throw new InvalidPasswordError('Password is too common. Please choose a more unique password');
    }
  }

  // Check for sequential characters
  if (rejectSequential && hasSequentialChars(password)) {
    throw new InvalidPasswordError('Password cannot contain sequential characters (e.g., "123", "abc")');
  }

  // Check for repetitive characters
  if (rejectRepetitive && hasRepetitiveChars(password, maxRepeat)) {
    throw new InvalidPasswordError(
      `Password cannot contain more than ${maxRepeat} consecutive identical characters`
    );
  }

  // Check character requirements
  if (requireUppercase && !/[A-Z]/.test(password)) {
    throw new InvalidPasswordError('Password must contain at least one uppercase letter (A-Z)');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    throw new InvalidPasswordError('Password must contain at least one lowercase letter (a-z)');
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    throw new InvalidPasswordError('Password must contain at least one number (0-9)');
  }

  if (requireSpecialChar) {
    // Enhanced special character regex
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
    if (!specialCharRegex.test(password)) {
      throw new InvalidPasswordError(
        'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
      );
    }
  }

  // Check minimum strength score
  const strength = calculatePasswordStrength(password);
  if (strength < minStrength) {
    throw new InvalidPasswordError(
      `Password strength is too weak (score: ${strength}/100). Minimum required: ${minStrength}/100`
    );
  }

  return {
    isValid: true,
    strength,
    strengthLevel: strength >= 80 ? 'strong' : strength >= 50 ? 'medium' : 'weak'
  };
};

/**
 * Validates a complete user object
 * @param {Object} user - The user object to validate
 * @param {string} user.name - User's name (required, 2-50 chars)
 * @param {string} user.email - User's email (required, valid email)
 * @param {number} user.age - User's age (required, 0-150)
 * @param {string} user.password - User's password (optional, validated if provided)
 * @returns {Object} Validated user object
 * @throws {UserValidationError} If validation fails
 */
const validateUser = (user) => {
  if (!user || typeof user !== 'object') {
    throw new UserValidationError(
      'User data must be an object',
      'INVALID_USER_DATA',
      null,
      { user }
    );
  }

  // Validate required fields
  validateRequired(user.name, 'name');
  validateRequired(user.email, 'email');
  validateRequired(user.age, 'age');

  // Validate field formats
  validateLength(user.name, 'name', 2, 50);
  validateEmail(user.email);
  validateAge(user.age, 0, 150);

  // Validate password if provided
  if (user.password !== undefined) {
    validatePassword(user.password);
  }

  return {
    name: user.name.trim(),
    email: user.email.toLowerCase().trim(),
    age: user.age,
    ...(user.password && { password: user.password })
  };
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateUser,
    validateRequired,
    validateLength,
    validateEmail,
    validateAge,
    validatePassword,
    calculatePasswordStrength,
    hasSequentialChars,
    hasRepetitiveChars,
    // Export error classes
    UserValidationError,
    RequiredFieldError,
    InvalidEmailError,
    InvalidAgeError,
    InvalidLengthError,
    InvalidPasswordError
  };
}


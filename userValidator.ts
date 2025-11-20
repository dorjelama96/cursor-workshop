/**
 * User Validation Module
 * Provides validation functions for user data
 */

// Type definitions
export interface UserValidationErrorContext {
  [key: string]: unknown;
}

export interface EmailValidationOptions {
  maxLength?: number;
  allowPlusSign?: boolean;
}

export interface PasswordValidationOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
  minStrength?: number;
  rejectCommonPasswords?: boolean;
  rejectSequential?: boolean;
  rejectRepetitive?: boolean;
  maxRepeat?: number;
}

export interface PasswordStrengthResult {
  isValid: true;
  strength: number;
  strengthLevel: 'weak' | 'medium' | 'strong';
}

export interface UserInput {
  name: string;
  email: string;
  age: number;
  password?: string;
}

export interface ValidatedUser {
  name: string;
  email: string;
  age: number;
  password?: string;
}

// Custom Error Classes for User Validation
/**
 * Base error class for user validation
 */
export class UserValidationError extends Error {
  public readonly code: string;
  public readonly field: string | null;
  public readonly context: UserValidationErrorContext;

  constructor(message: string, code: string, field: string | null = null, context: UserValidationErrorContext = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.field = field;
    this.context = context;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a required field is missing
 */
export class RequiredFieldError extends UserValidationError {
  constructor(fieldName: string) {
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
export class InvalidEmailError extends UserValidationError {
  constructor(email: string) {
    super(
      `Invalid email format: ${email}`,
      'INVALID_EMAIL',
      'email',
      { email }
    );
  }
}

/**
 * Error thrown when a value is not a valid number
 */
export class InvalidAgeError extends UserValidationError {
  constructor(age: number, minAge: number = 0, maxAge: number = 150) {
    super(
      `Invalid age: ${age}. Age must be between ${minAge} and ${maxAge}`,
      'INVALID_AGE',
      'age',
      { age, minAge, maxAge }
    );
  }
}

/**
 * Error thrown when a string length is invalid
 */
export class InvalidLengthError extends UserValidationError {
  constructor(fieldName: string, value: string, minLength: number, maxLength: number) {
    super(
      `Invalid length for "${fieldName}": ${value.length} characters. Must be between ${minLength} and ${maxLength} characters`,
      'INVALID_LENGTH',
      fieldName,
      { value, minLength, maxLength, actualLength: value.length }
    );
  }
}

/**
 * Error thrown when a password doesn't meet requirements
 */
export class InvalidPasswordError extends UserValidationError {
  constructor(reason: string) {
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
 * @param value - The value to validate
 * @param fieldName - The field name for error messages
 * @throws {RequiredFieldError} If value is missing or empty
 */
export const validateRequired = (value: unknown, fieldName: string): asserts value is string | number | boolean => {
  if (value === null || value === undefined || value === '') {
    throw new RequiredFieldError(fieldName);
  }
};

/**
 * Validates that a string has a valid length
 * @param value - The string to validate
 * @param fieldName - The field name for error messages
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 255)
 * @throws {InvalidLengthError} If length is invalid
 */
export const validateLength = (value: unknown, fieldName: string, minLength: number = 1, maxLength: number = 255): asserts value is string => {
  if (typeof value !== 'string') {
    throw new UserValidationError(
      `Field "${fieldName}" must be a string`,
      'INVALID_TYPE',
      fieldName,
      { value, expectedType: 'string' }
    );
  }
  if (value.length < minLength || value.length > maxLength) {
    throw new InvalidLengthError(fieldName, value, minLength, maxLength);
  }
};

/**
 * Validates email format
 * @param email - The email to validate
 * @param options - Validation options
 * @throws {InvalidEmailError} If email format is invalid
 */
export const validateEmail = (email: string, options: EmailValidationOptions = {}): void => {
  const { maxLength = 254, allowPlusSign = true } = options;
  
  if (typeof email !== 'string') {
    throw new InvalidEmailError(email || 'undefined');
  }
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  
  // Check if empty after trimming
  if (!trimmedEmail) {
    throw new InvalidEmailError(email);
  }
  
  // Check length (RFC 5321 limit)
  if (trimmedEmail.length > maxLength) {
    throw new InvalidEmailError(email);
  }
  
  // Split email into local and domain parts
  const parts = trimmedEmail.split('@');
  
  if (parts.length !== 2) {
    throw new InvalidEmailError(email);
  }
  
  const [localPart, domain] = parts;
  
  // Validate local part (before @)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    throw new InvalidEmailError(email);
  }
  
  // Local part cannot start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    throw new InvalidEmailError(email);
  }
  
  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    throw new InvalidEmailError(email);
  }
  
  // Validate local part characters
  const localPartRegex = allowPlusSign 
    ? /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/
    : /^[a-zA-Z0-9.!#$%&'*\/=?^_`{|}~-]+$/;
  
  if (!localPartRegex.test(localPart)) {
    throw new InvalidEmailError(email);
  }
  
  // Validate domain part (after @)
  if (!domain || domain.length === 0 || domain.length > 253) {
    throw new InvalidEmailError(email);
  }
  
  // Domain cannot start or end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    throw new InvalidEmailError(email);
  }
  
  // Domain must contain at least one dot
  if (!domain.includes('.')) {
    throw new InvalidEmailError(email);
  }
  
  // Split domain into labels
  const domainLabels = domain.split('.');
  
  // Each label must be 1-63 characters
  for (const label of domainLabels) {
    if (label.length === 0 || label.length > 63) {
      throw new InvalidEmailError(email);
    }
    // Label can only contain letters, numbers, and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      throw new InvalidEmailError(email);
    }
    // Label cannot start or end with hyphen
    if (label.startsWith('-') || label.endsWith('-')) {
      throw new InvalidEmailError(email);
    }
  }
  
  // Top-level domain must be at least 2 characters
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    throw new InvalidEmailError(email);
  }
};

/**
 * Validates age is within valid range
 * @param age - The age to validate
 * @param minAge - Minimum age (default: 0)
 * @param maxAge - Maximum age (default: 150)
 * @throws {InvalidAgeError} If age is invalid
 */
export const validateAge = (age: number, minAge: number = 0, maxAge: number = 150): void => {
  if (typeof age !== 'number' || !Number.isInteger(age) || age < minAge || age > maxAge) {
    throw new InvalidAgeError(age, minAge, maxAge);
  }
};

/**
 * Common weak passwords that should be rejected
 */
const COMMON_PASSWORDS: readonly string[] = [
  'password', 'password123', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'abc123', 'admin', 'letmein',
  'welcome', 'monkey', '1234567', 'password1', 'sunshine',
  'master', 'hello', 'freedom', 'whatever', 'trustno1'
] as const;

/**
 * Checks if password contains sequential characters (e.g., "12345", "abcde")
 * @param password - The password to check
 * @returns True if sequential characters found
 */
export const hasSequentialChars = (password: string): boolean => {
  const sequences: readonly string[] = [
    '0123456789',
    '9876543210',
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'ZYXWVUTSRQPONMLKJIHGFEDCBA'
  ] as const;
  
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
 * @param password - The password to check
 * @param maxRepeat - Maximum allowed consecutive repeats (default: 2)
 * @returns True if too many repetitive characters found
 */
export const hasRepetitiveChars = (password: string, maxRepeat: number = 2): boolean => {
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
 * @param password - The password to score
 * @returns Strength score from 0 to 100
 */
export const calculatePasswordStrength = (password: string): number => {
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
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Validation result with strength score
 * @throws {InvalidPasswordError} If password doesn't meet requirements
 */
export const validatePassword = (password: string, options: PasswordValidationOptions = {}): PasswordStrengthResult => {
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
 * @param user - The user object to validate
 * @returns Validated user object
 * @throws {UserValidationError} If validation fails
 */
export const validateUser = (user: UserInput): ValidatedUser => {
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


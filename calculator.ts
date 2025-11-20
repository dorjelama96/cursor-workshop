/**
 * Simple Calculator
 * A basic calculator implementation for learning purposes
 */

// Type definitions
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface CalculatorErrorContext {
  [key: string]: unknown;
}

export interface OperationHandlers {
  [key: string]: (a: number, b: number) => number;
}

// Constants - Using Object.freeze for immutability
export const OPERATIONS = Object.freeze({
  ADD: 'add' as const,
  SUBTRACT: 'subtract' as const,
  MULTIPLY: 'multiply' as const,
  DIVIDE: 'divide' as const
}) as Readonly<Record<string, Operation>>;

export const PERCENTAGE_DIVISOR = 100 as const;

// Get valid operations as array (cached)
export const VALID_OPERATIONS: readonly Operation[] = Object.values(OPERATIONS) as Operation[];

// Custom Error Classes
/**
 * Base error class for calculator operations
 */
export class CalculatorError extends Error {
  public readonly code: string;
  public readonly context: CalculatorErrorContext;

  constructor(message: string, code: string, context: CalculatorErrorContext = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when dividing by zero
 */
export class DivisionByZeroError extends CalculatorError {
  constructor(dividend: number, divisor: number) {
    super(
      `Cannot divide ${dividend} by zero. Division by zero is undefined.`,
      'DIVISION_BY_ZERO',
      { dividend, divisor }
    );
  }
}

/**
 * Error thrown when an invalid operation is requested
 */
export class InvalidOperationError extends CalculatorError {
  constructor(operation: string, validOperations: readonly Operation[]) {
    super(
      `Invalid operation: "${operation}". Valid operations are: ${validOperations.join(', ')}`,
      'INVALID_OPERATION',
      { operation, validOperations }
    );
  }
}

/**
 * Error thrown when a value is not a valid number
 */
export class InvalidNumberError extends CalculatorError {
  constructor(value: unknown, parameterName: string, receivedType: string) {
    const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
    super(
      `Invalid number for parameter "${parameterName}": received ${valueStr} (type: ${receivedType}). Expected a finite number.`,
      'INVALID_NUMBER',
      { value, parameterName, receivedType, expectedType: 'number' }
    );
  }
}

/**
 * Error thrown when a value is not a valid non-negative integer
 */
export class InvalidIntegerError extends CalculatorError {
  constructor(value: unknown, parameterName: string) {
    const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
    super(
      `Invalid integer for parameter "${parameterName}": received ${valueStr}. Expected a non-negative integer.`,
      'INVALID_INTEGER',
      { value, parameterName, expectedType: 'non-negative integer' }
    );
  }
}

// Validation helpers - Using arrow functions and modern syntax
/**
 * Validates that a value is a finite number
 * @param value - The value to validate
 * @param name - The parameter name for error messages
 * @throws {InvalidNumberError} If value is not a finite number
 */
export const validateNumber = (value: unknown, name: string): asserts value is number => {
  const receivedType = typeof value;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidNumberError(value, name, receivedType);
  }
};

/**
 * Validates that a value is a non-negative integer
 * @param value - The value to validate
 * @param name - The parameter name for error messages
 * @throws {InvalidIntegerError} If value is not a non-negative integer
 */
export const validateNonNegativeInteger = (value: unknown, name: string): asserts value is number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new InvalidIntegerError(value, name);
  }
};

// Operation handlers - Using Object.freeze for immutability
export const OPERATION_HANDLERS: Readonly<OperationHandlers> = Object.freeze({
  [OPERATIONS.ADD]: (a: number, b: number): number => a + b,
  [OPERATIONS.SUBTRACT]: (a: number, b: number): number => a - b,
  [OPERATIONS.MULTIPLY]: (a: number, b: number): number => a * b,
  [OPERATIONS.DIVIDE]: (a: number, b: number): number => {
    if (b === 0) {
      throw new DivisionByZeroError(a, b);
    }
    return a / b;
  }
});

/**
 * Performs basic arithmetic operations
 * @param a - First number
 * @param b - Second number
 * @param operation - The operation to perform (add, subtract, multiply, divide)
 * @returns The result of the operation
 * @throws {InvalidNumberError} If inputs are not valid numbers
 * @throws {InvalidOperationError} If operation is unknown
 * @throws {DivisionByZeroError} If dividing by zero
 */
export const calculate = (a: number, b: number, operation: Operation): number => {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  
  if (typeof operation !== 'string') {
    throw new InvalidNumberError(operation, 'operation', typeof operation);
  }
  
  switch (operation) {
    case OPERATIONS.ADD:
      return a + b;
    case OPERATIONS.SUBTRACT:
      return a - b;
    case OPERATIONS.MULTIPLY:
      return a * b;
    case OPERATIONS.DIVIDE:
      if (b === 0) {
        throw new DivisionByZeroError(a, b);
      }
      return a / b;
    default:
      throw new InvalidOperationError(operation, VALID_OPERATIONS);
  }
};

/**
 * Calculates the square of a number
 * @param n - The number to square
 * @returns The square of n
 * @throws {InvalidNumberError} If n is not a finite number
 */
export const square = (n: number): number => {
  validateNumber(n, 'n');
  return n ** 2; // Using exponentiation operator instead of n * n
};

/**
 * Multiplies two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 * @throws {InvalidNumberError} If inputs are not finite numbers
 */
export const multiply = (a: number, b: number): number => {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  return a * b;
};

/**
 * Calculates the percentage of a number
 * @param value - The value
 * @param percent - The percentage to calculate
 * @returns The percentage value
 * @throws {InvalidNumberError} If inputs are not finite numbers
 */
export const percentage = (value: number, percent: number): number => {
  validateNumber(value, 'value');
  validateNumber(percent, 'percent');
  return (value * percent) / PERCENTAGE_DIVISOR;
};

/**
 * Rounds a number to specified decimal places
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded value
 * @throws {InvalidNumberError} If value is not a finite number
 * @throws {InvalidIntegerError} If decimals is not a non-negative integer
 */
export const roundTo = (value: number, decimals: number = 2): number => {
  validateNumber(value, 'value');
  validateNonNegativeInteger(decimals, 'decimals');
  
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
};


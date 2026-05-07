import { AppError } from '../utils/appError.js';

/**
 * Validation middleware factory for Zod schemas
 * Creates a middleware function that validates request body, params, or query against a schema
 *
 * @param {Object} schema - Zod validation schema
 * @param {string} source - 'body', 'params', or 'query' - where to validate from (default: 'body')
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];

      // Parse and validate the data
      const validated = schema.parse(dataToValidate);

      // Replace original data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.') || source,
          message: err.message,
          code: err.code,
        }));

        const message = `Validation failed: ${formattedErrors.map((e) => `${e.field} - ${e.message}`).join('; ')}`;
        return next(new AppError(message, 400));
      }

      // Generic error
      return next(new AppError(`Validation error: ${error.message}`, 400));
    }
  };
};

/**
 * Validate data against a Zod schema
 * Useful for manual validation in controllers
 *
 * @param {Object} schema - Zod validation schema
 * @param {Object} data - Data to validate
 * @returns {Object} { valid: boolean, data: validated data, errors: validation errors }
 */
export const validateData = (schema, data) => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated, errors: null };
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { valid: false, data: null, errors };
    }
    return { valid: false, data: null, errors: [{ message: error.message }] };
  }
};

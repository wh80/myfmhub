// middleware/validation.js

import { validationErrorResponse } from "../utils/generalUtils.js";

// Validate Create / update Rquests - per route
const validateRequest = (schema) => (req, res, next) => {
  console.log("Validation Middleware - Validating Request");

  try {
    // Validate body with passed schema
    const parsed = schema.parse(req.body);
    req.validated = parsed;

    console.log("Validation Middleware - Validation PASSED");
    next();
  } catch (err) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    console.log("Validation Middleware - Validation FAILED");
    return validationErrorResponse(res, formatted);
  }
};

export default validateRequest;

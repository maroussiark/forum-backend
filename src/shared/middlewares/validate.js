import { badRequest } from "../errors/ApiError.js";

export const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return next(
      badRequest(
        "Validation error",
        "VALIDATION_ERROR",
        error.details.map((d) => d.message)
      )
    );
  }

  req[property] = value;
  next();
};

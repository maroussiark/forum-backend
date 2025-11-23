import { badRequest } from "../errors/ApiError.js";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const data = req[property];

    const { value, error } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      throw badRequest(error.details.map(e => e.message).join(", "));
    }

    Object.assign(req[property], value);

    next();
  };
};

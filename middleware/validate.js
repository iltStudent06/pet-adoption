const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: {
      code: 400,
      message: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    },
  });
};

module.exports = validate;

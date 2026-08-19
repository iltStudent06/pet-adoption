const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),
  body("role").optional().isIn(["applicant", "staff"]).withMessage("Role must be applicant or staff"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};

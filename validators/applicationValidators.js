const { body } = require("express-validator");

const createApplicationValidator = [
  body("pet").isMongoId().withMessage("Valid pet id is required"),
  body("message")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Message must be 20-1000 characters"),
];

const updateApplicationStatusValidator = [
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
];

module.exports = {
  createApplicationValidator,
  updateApplicationStatusValidator,
};

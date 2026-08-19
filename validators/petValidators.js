const { body } = require("express-validator");

const petValidator = [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters"),
  body("species")
    .isIn(["dog", "cat", "rabbit", "bird", "other"])
    .withMessage("Species must be dog, cat, rabbit, bird, or other"),
  body("breed").trim().isLength({ min: 2, max: 60 }).withMessage("Breed must be 2-60 characters"),
  body("age").isInt({ min: 0, max: 30 }).withMessage("Age must be a number between 0 and 30"),
  body("size").isIn(["small", "medium", "large"]).withMessage("Size must be small, medium, or large"),
  body("status")
    .optional()
    .isIn(["available", "pending", "adopted"])
    .withMessage("Status must be available, pending, or adopted"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be 20-500 characters"),
  body("photoUrl").optional().isURL().withMessage("Photo URL must be a valid URL"),
];

module.exports = {
  petValidator,
};

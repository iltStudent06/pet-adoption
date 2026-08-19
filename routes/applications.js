const express = require("express");

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");
const {
  createApplicationValidator,
  updateApplicationStatusValidator,
} = require("../validators/applicationValidators");

const router = express.Router();

router.get("/", auth, getApplications);
router.post("/", auth, requireRole("applicant"), createApplicationValidator, validate, createApplication);
router.put(
  "/:id",
  auth,
  requireRole("staff"),
  updateApplicationStatusValidator,
  validate,
  updateApplicationStatus
);
router.delete("/:id", auth, deleteApplication);

module.exports = router;

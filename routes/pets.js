const express = require("express");

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const { listPets, getPetById, createPet, updatePet, deletePet } = require("../controllers/petController");
const { petValidator } = require("../validators/petValidators");

const router = express.Router();

router.get("/", listPets);
router.get("/:id", getPetById);
router.post("/", auth, requireRole("staff"), petValidator, validate, createPet);
router.put("/:id", auth, requireRole("staff"), petValidator, validate, updatePet);
router.delete("/:id", auth, requireRole("staff"), deletePet);

module.exports = router;

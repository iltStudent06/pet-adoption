const Pet = require("../models/Pet");

const listPets = async (req, res, next) => {
  try {
    const {
      species,
      breed,
      size,
      status,
      minAge,
      maxAge,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (species) filter.species = species;
    if (breed) filter.breed = new RegExp(breed, "i");
    if (size) filter.size = size;
    if (status) filter.status = status;

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    const sort = {};
    const sortFields = String(sortBy)
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);

    sortFields.forEach((field) => {
      sort[field] = order === "asc" ? 1 : -1;
    });

    const safeLimit = Math.min(Math.max(Number(limit), 1), 100);
    const safePage = Math.max(Number(page), 1);
    const skip = (safePage - 1) * safeLimit;

    const [pets, total] = await Promise.all([
      Pet.find(filter).sort(sort).skip(skip).limit(safeLimit).populate("createdBy", "name email role"),
      Pet.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: pets,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("createdBy", "name email role");

    if (!pet) {
      const error = new Error("Pet not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ data: pet });
  } catch (error) {
    return next(error);
  }
};

const createPet = async (req, res, next) => {
  try {
    const pet = await Pet.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ data: pet });
  } catch (error) {
    return next(error);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pet) {
      const error = new Error("Pet not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ data: pet });
  } catch (error) {
    return next(error);
  }
};

const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);

    if (!pet) {
      const error = new Error("Pet not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};

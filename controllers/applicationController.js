const AdoptionApplication = require("../models/AdoptionApplication");
const Pet = require("../models/Pet");

const syncPetStatusAfterRejectionOrWithdrawal = async (petId) => {
  const pet = await Pet.findById(petId);

  if (!pet) {
    return;
  }

  if (pet.status === "adopted") {
    return;
  }

  const hasPendingApplications = await AdoptionApplication.exists({
    pet: petId,
    status: "pending",
  });

  pet.status = hasPendingApplications ? "pending" : "available";
  await pet.save();
};

const getApplications = async (req, res, next) => {
  try {
    const filter = req.user.role === "staff" ? {} : { applicant: req.user.userId };

    const applications = await AdoptionApplication.find(filter)
      .sort({ createdAt: -1 })
      .populate("pet", "name species breed age size status")
      .populate("applicant", "name email");

    return res.status(200).json({ data: applications });
  } catch (error) {
    return next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.body.pet);
    if (!pet) {
      const error = new Error("Pet not found");
      error.statusCode = 404;
      throw error;
    }

    if (pet.status === "adopted") {
      const error = new Error("Pet has already been adopted");
      error.statusCode = 400;
      throw error;
    }

    const application = await AdoptionApplication.create({
      pet: req.body.pet,
      applicant: req.user.userId,
      message: req.body.message,
    });

    if (pet.status !== "pending") {
      pet.status = "pending";
      await pet.save();
    }

    const populatedApplication = await application.populate([
      { path: "pet", select: "name species breed age size status" },
      { path: "applicant", select: "name email" },
    ]);

    return res.status(201).json({ data: populatedApplication });
  } catch (error) {
    return next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      const error = new Error("Application not found");
      error.statusCode = 404;
      throw error;
    }

    application.status = req.body.status;
    await application.save();

    if (req.body.status === "approved") {
      await Pet.findByIdAndUpdate(application.pet, { status: "adopted" });

      await AdoptionApplication.updateMany(
        {
          pet: application.pet,
          _id: { $ne: application._id },
          status: "pending",
        },
        { $set: { status: "rejected" } }
      );
    }

    if (req.body.status === "rejected") {
      await syncPetStatusAfterRejectionOrWithdrawal(application.pet);
    }

    const populatedApplication = await application.populate([
      { path: "pet", select: "name species breed age size status" },
      { path: "applicant", select: "name email role" },
    ]);

    return res.status(200).json({ data: populatedApplication });
  } catch (error) {
    return next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      const error = new Error("Application not found");
      error.statusCode = 404;
      throw error;
    }

    if (application.applicant.toString() !== req.user.userId) {
      const error = new Error("Forbidden: you can only withdraw your own application");
      error.statusCode = 403;
      throw error;
    }

    const wasPending = application.status === "pending";
    const petId = application.pet;

    await application.deleteOne();

    if (wasPending) {
      await syncPetStatusAfterRejectionOrWithdrawal(petId);
    }

    return res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
};

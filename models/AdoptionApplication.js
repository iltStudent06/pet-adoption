const mongoose = require("mongoose");

const adoptionApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant reference is required"],
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: [true, "Pet reference is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      required: [true, "Application message is required"],
      minlength: [20, "Application message must be at least 20 characters"],
      maxlength: [1000, "Application message cannot exceed 1000 characters"],
      trim: true,
      validate: {
        validator: (value) => !/http(s)?:\/\//i.test(value),
        message: "Application message cannot contain URLs",
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

adoptionApplicationSchema.index({ applicant: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model("AdoptionApplication", adoptionApplicationSchema);

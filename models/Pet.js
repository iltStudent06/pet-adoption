const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pet name is required"],
      minlength: [2, "Pet name must be at least 2 characters"],
      maxlength: [60, "Pet name cannot exceed 60 characters"],
      trim: true,
      validate: {
        validator: (value) => value.trim().length === value.length,
        message: "Pet name cannot start or end with spaces",
      },
    },
    species: {
      type: String,
      required: [true, "Species is required"],
      enum: {
        values: ["dog", "cat", "rabbit", "bird", "other"],
        message: "Species must be one of dog, cat, rabbit, bird, other",
      },
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      minlength: [2, "Breed must be at least 2 characters"],
      maxlength: [60, "Breed cannot exceed 60 characters"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [30, "Age cannot be greater than 30"],
    },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      required: [true, "Size is required"],
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?$/, "Photo URL must be a valid URL"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

petSchema.index({ species: 1, status: 1 });
petSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Pet", petSchema);

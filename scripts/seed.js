require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const Pet = require("../models/Pet");
const AdoptionApplication = require("../models/AdoptionApplication");

const SAMPLE_USERS = [
  {
    name: "Shelter Staff",
    email: "staff@example.com",
    password: "Password123",
    role: "staff",
  },
  {
    name: "Applicant User 1",
    email: "applicant1@example.com",
    password: "Password123",
    role: "applicant",
  },
  {
    name: "Applicant User 2",
    email: "applicant2@example.com",
    password: "Password123",
    role: "applicant",
  },
];

const seed = async () => {
  await connectDB();

  try {
    const sampleEmails = SAMPLE_USERS.map((user) => user.email);
    const existingUsers = await User.find({ email: { $in: sampleEmails } }).select("_id");
    const existingUserIds = existingUsers.map((user) => user._id);

    const existingPets = await Pet.find({ createdBy: { $in: existingUserIds } }).select("_id");
    const existingPetIds = existingPets.map((pet) => pet._id);

    await AdoptionApplication.deleteMany({
      $or: [
        { applicant: { $in: existingUserIds } },
        { pet: { $in: existingPetIds } },
      ],
    });
    await Pet.deleteMany({ createdBy: { $in: existingUserIds } });
    await User.deleteMany({ email: { $in: sampleEmails } });

    const createdUsers = [];
    for (const userData of SAMPLE_USERS) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }

    const staff = createdUsers.find((user) => user.role === "staff");
    const applicants = createdUsers.filter((user) => user.role === "applicant");

    const pets = await Pet.create([
      {
        name: "Buddy",
        species: "dog",
        breed: "Labrador",
        age: 3,
        size: "large",
        status: "available",
        description: "Friendly and energetic dog looking for an active family home.",
        photoUrl: "https://images.example.com/buddy.jpg",
        createdBy: staff._id,
      },
      {
        name: "Mittens",
        species: "cat",
        breed: "Domestic Shorthair",
        age: 2,
        size: "small",
        status: "pending",
        description: "Calm indoor cat that loves attention and sunny window naps.",
        photoUrl: "https://images.example.com/mittens.jpg",
        createdBy: staff._id,
      },
      {
        name: "Sunny",
        species: "bird",
        breed: "Cockatiel",
        age: 1,
        size: "small",
        status: "adopted",
        description: "Playful bird that enjoys social interaction and gentle handling.",
        photoUrl: "https://images.example.com/sunny.jpg",
        createdBy: staff._id,
      },
      {
        name: "Daisy",
        species: "dog",
        breed: "Beagle",
        age: 4,
        size: "medium",
        status: "available",
        description: "Curious and gentle beagle who enjoys long sniff walks and puzzle toys.",
        photoUrl: "https://images.example.com/daisy.jpg",
        createdBy: staff._id,
      },
      {
        name: "Rocky",
        species: "dog",
        breed: "German Shepherd",
        age: 5,
        size: "large",
        status: "available",
        description: "Loyal and smart companion with strong obedience basics and great focus.",
        photoUrl: "https://images.example.com/rocky.jpg",
        createdBy: staff._id,
      },
      {
        name: "Luna",
        species: "cat",
        breed: "Siamese",
        age: 3,
        size: "small",
        status: "available",
        description: "Talkative and affectionate cat that thrives on interactive play and cuddles.",
        photoUrl: "https://images.example.com/luna.jpg",
        createdBy: staff._id,
      },
      {
        name: "Oliver",
        species: "cat",
        breed: "Maine Coon",
        age: 6,
        size: "large",
        status: "pending",
        description: "Calm giant fluffball that gets along well with gentle children and routines.",
        photoUrl: "https://images.example.com/oliver.jpg",
        createdBy: staff._id,
      },
      {
        name: "Hazel",
        species: "rabbit",
        breed: "Holland Lop",
        age: 2,
        size: "small",
        status: "available",
        description: "Sweet rabbit who enjoys fresh greens, tunnels, and quiet evening petting.",
        photoUrl: "https://images.example.com/hazel.jpg",
        createdBy: staff._id,
      },
      {
        name: "Clover",
        species: "rabbit",
        breed: "Mini Rex",
        age: 1,
        size: "small",
        status: "available",
        description: "Playful rabbit with velvety coat and a curious personality around people.",
        photoUrl: "https://images.example.com/clover.jpg",
        createdBy: staff._id,
      },
      {
        name: "Pico",
        species: "bird",
        breed: "Budgerigar",
        age: 2,
        size: "small",
        status: "available",
        description: "Chirpy budgie that likes music, millet treats, and social cage time daily.",
        photoUrl: "https://images.example.com/pico.jpg",
        createdBy: staff._id,
      },
      {
        name: "Skye",
        species: "bird",
        breed: "Parakeet",
        age: 3,
        size: "small",
        status: "pending",
        description: "Bright and social parakeet that responds well to consistent handling sessions.",
        photoUrl: "https://images.example.com/skye.jpg",
        createdBy: staff._id,
      },
      {
        name: "Max",
        species: "dog",
        breed: "Border Collie",
        age: 2,
        size: "medium",
        status: "available",
        description: "Highly active and trainable dog best suited for a home with outdoor space.",
        photoUrl: "https://images.example.com/max.jpg",
        createdBy: staff._id,
      },
      {
        name: "Nala",
        species: "cat",
        breed: "Calico",
        age: 4,
        size: "small",
        status: "available",
        description: "Independent but loving cat who likes cozy spots and gentle daily brushing.",
        photoUrl: "https://images.example.com/nala.jpg",
        createdBy: staff._id,
      },
      {
        name: "Biscuit",
        species: "other",
        breed: "Guinea Pig",
        age: 1,
        size: "small",
        status: "available",
        description: "Friendly guinea pig that squeaks for veggies and enjoys supervised floor time.",
        photoUrl: "https://images.example.com/biscuit.jpg",
        createdBy: staff._id,
      },
      {
        name: "Willow",
        species: "other",
        breed: "Ferret",
        age: 3,
        size: "small",
        status: "available",
        description: "Curious ferret who loves tunnels, enrichment games, and gentle interaction.",
        photoUrl: "https://images.example.com/willow.jpg",
        createdBy: staff._id,
      },
    ]);

    const [buddy, mittens, sunny] = pets;

    const applications = await AdoptionApplication.create([
      {
        applicant: applicants[0]._id,
        pet: buddy._id,
        status: "pending",
        message: "I have a fenced yard and daily time for training, walks, and enrichment.",
      },
      {
        applicant: applicants[1]._id,
        pet: mittens._id,
        status: "pending",
        message: "I have a quiet apartment setup and prior experience caring for rescue cats.",
      },
      {
        applicant: applicants[0]._id,
        pet: sunny._id,
        status: "approved",
        message: "I can provide a spacious cage setup and regular social interaction each day.",
      },
    ]);

    console.log("Seed completed successfully.");
    console.log("Sample login credentials:");
    console.log("- staff@example.com / Password123");
    console.log("- applicant1@example.com / Password123");
    console.log("- applicant2@example.com / Password123");
    console.log(`Created users: ${createdUsers.length}`);
    console.log(`Created pets: ${pets.length}`);
    console.log(`Created applications: ${applications.length}`);
  } finally {
    await mongoose.disconnect();
  }
};

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });

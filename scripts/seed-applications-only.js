require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const Pet = require("../models/Pet");
const AdoptionApplication = require("../models/AdoptionApplication");

const STAFF_EMAIL = "staff@example.com";
const APPLICANT_EMAILS = ["applicant1@example.com", "applicant2@example.com"];
const TARGET_PET_NAMES = ["Buddy", "Mittens", "Sunny", "Daisy", "Rocky"];

const seedApplicationsOnly = async () => {
  await connectDB();

  try {
    const staff = await User.findOne({ email: STAFF_EMAIL });
    const applicants = await User.find({ email: { $in: APPLICANT_EMAILS } });

    if (!staff || applicants.length < 2) {
      throw new Error(
        "Required sample users were not found. Run `npm run seed` first to create baseline data."
      );
    }

    const pets = await Pet.find({
      name: { $in: TARGET_PET_NAMES },
      createdBy: staff._id,
    });

    const petMap = TARGET_PET_NAMES.reduce((map, name) => {
      const pet = pets.find((currentPet) => currentPet.name === name);
      if (pet) {
        map[name] = pet;
      }
      return map;
    }, {});

    const hasAllTargetPets = TARGET_PET_NAMES.every((name) => Boolean(petMap[name]));
    if (!hasAllTargetPets) {
      throw new Error(
        "Required sample pets were not found. Run `npm run seed` first to create baseline data."
      );
    }

    const applicantIds = applicants.map((user) => user._id);
    const petIds = Object.values(petMap).map((pet) => pet._id);

    await AdoptionApplication.deleteMany({
      $or: [{ applicant: { $in: applicantIds } }, { pet: { $in: petIds } }],
    });

    const applications = await AdoptionApplication.create([
      {
        applicant: applicants[0]._id,
        pet: petMap.Buddy._id,
        status: "pending",
        message: "I can provide long walks, enrichment activities, and positive training every day.",
      },
      {
        applicant: applicants[1]._id,
        pet: petMap.Buddy._id,
        status: "pending",
        message: "I work from home and can provide regular exercise plus socialization routines.",
      },
      {
        applicant: applicants[0]._id,
        pet: petMap.Mittens._id,
        status: "pending",
        message: "I have a calm home setup and plenty of time for gentle indoor cat care.",
      },
      {
        applicant: applicants[1]._id,
        pet: petMap.Mittens._id,
        status: "rejected",
        message: "I can provide a stable routine and a quiet area for stress-free cat adjustment.",
      },
      {
        applicant: applicants[0]._id,
        pet: petMap.Sunny._id,
        status: "approved",
        message: "I have prior bird-care experience and can provide daily social interaction.",
      },
      {
        applicant: applicants[1]._id,
        pet: petMap.Sunny._id,
        status: "rejected",
        message: "I can offer a safe cage setup and enrichment schedule tailored for parrots.",
      },
      {
        applicant: applicants[0]._id,
        pet: petMap.Daisy._id,
        status: "pending",
        message: "My family has experience with medium dogs and we have a secure yard and schedule.",
      },
      {
        applicant: applicants[1]._id,
        pet: petMap.Daisy._id,
        status: "pending",
        message: "I can provide regular training, long walks, and daily enrichment activities.",
      },
      {
        applicant: applicants[0]._id,
        pet: petMap.Rocky._id,
        status: "pending",
        message: "I am active daily and can support this dog with consistent structure and exercise.",
      },
      {
        applicant: applicants[1]._id,
        pet: petMap.Rocky._id,
        status: "pending",
        message: "I can provide ongoing obedience practice and engagement for a working-breed dog.",
      },
    ]);

    for (const pet of Object.values(petMap)) {
      const petApplications = applications.filter(
        (application) => application.pet.toString() === pet._id.toString()
      );

      const hasApproved = petApplications.some((application) => application.status === "approved");
      const hasPending = petApplications.some((application) => application.status === "pending");

      const nextStatus = hasApproved ? "adopted" : hasPending ? "pending" : "available";
      await Pet.findByIdAndUpdate(pet._id, { status: nextStatus });
    }

    console.log("Application-only seed completed successfully.");
    console.log(`Recreated applications: ${applications.length}`);
    console.log(
      "Updated pet statuses: Buddy=pending, Mittens=pending, Sunny=adopted, Daisy=pending, Rocky=pending"
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedApplicationsOnly()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Application-only seed failed:", error.message);
    process.exit(1);
  });

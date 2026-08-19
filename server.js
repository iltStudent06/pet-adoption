require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pets");
const applicationRoutes = require("./routes/applications");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/applications", applicationRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email is already registered");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("_id name email role createdAt updatedAt");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

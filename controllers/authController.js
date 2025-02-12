const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const validateUserInput = ({ fullname, email, password }) => {
  if (!fullname || !email || !password) {
    return "Please fill in all required fields.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
};

const validateLoginInput = ({ email, password }) => {
    if (!email || !password) {
      return "Please enter both email and password.";
    }
    return null;
  };

const SignUp = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validate input
  const validationError = validateUserInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  // Check if user exists
  if (await User.findOne({ email })) {
    return res
      .status(400)
      .json({ message: "Email has already been registered." });
  }

  try {
    // Create new user
    const user = await User.create({ fullname, email, password });

    // Generate JWT Token
    const token = generateToken(user._id);

    // Set cookie with token
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      sameSite: "none",
      secure: true,
    });

    // Send response without password
    const { password: _, ...userData } = user._doc;
    res.status(201).json({ ...userData, token });
  } catch (error) {
    console.error("Error in signUp controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const SignIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    const validationError = validateLoginInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found. Please sign up." });
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
  
      // Generate JWT Token
      const token = generateToken(user._id);
  
      // Set token as HTTP-only cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        sameSite: "none",
        secure: true,
      });
  
      // Send response without password
      const { password: _, ...userData } = user._doc;
      res.status(200).json({ ...userData, token });
  
    } catch (error) {
      console.error("Error in signIn controller:", error);
      res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
  });

module.exports = {
  SignUp,
  SignIn
};

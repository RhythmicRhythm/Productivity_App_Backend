const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validation
  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ message: "Email has already been registered" });
  }

  try {
    const user = await User.create({
      fullname,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { password: _, ...userData } = user._doc;
    res.status(201).json({ ...userData, token });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate Request
    if (!email || !password) {
      return res.status(400).json({ message: "Please add email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please sign up" });
    }

    // Check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { password: _, ...userData } = user._doc;
    res.status(200).json({ ...userData, token });
  } catch (error) {
    console.log("Error in signin controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  try {
    const { title, semester, department, dob } = req.body;

    if (!user) {
      res.status(400);
      throw new Error("error findng user");
    }

    user.title = title;
    user.semester = semester;
    user.department = department;
    user.dob = dob;

    if (req.file) {
      const file = req.file;
      //  Handle image upload  tempFilePath
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: `${Date.now()}`,
        transformation: [
          { width: 1080, height: 1080, quality: 80, crop: "fill" },
        ],
      });

      user.photo = result.secure_url;
      console.log(result);
    }

    await user.save();

    console.log("updated");
    res.status(200).json(user);
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Find all users and exclude the password field
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  loginStatus,
  getAllUsers,
  getUser,

  updateUser,
  changePassword,
  // forgotPassword,
  // resetemailsent,
  // resetPassword,
};

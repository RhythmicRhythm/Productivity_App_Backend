const express = require("express");
const { SignUp, SignIn } = require("../controllers/authController");

const router = express.Router();

router.post("/sign-up", SignUp);

router.post("/sign-in", SignIn);

module.exports = router;

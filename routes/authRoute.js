const express = require("express");
const { signUp, signIn, authStatus, signOut } = require("../controllers/authController");

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/check-auth", authStatus);
router.get("/sign-out", signOut);

module.exports = router;

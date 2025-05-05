const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otp.controller");

// Route: Tạo mã OTP
router.post("/create", otpController.createOtp);

// Route: Kiểm tra mã OTP
router.post("/verify", otpController.checkOtp);

module.exports = router;
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");

// Lấy danh sách mã giảm giá với phân trang, lọc, và tìm kiếm
router.get("/", couponController.getAllCoupons);

// Lấy mã giảm giá theo ID
router.get("/:id", couponController.getCouponById);

// Tạo mới mã giảm giá
router.post("/", couponController.createCoupon);

// Cập nhật mã giảm giá
router.put("/:id", couponController.updateCoupon);

// Xóa mềm mã giảm giá
router.delete("/:id", couponController.softDeleteCoupon);

// Khôi phục mã giảm giá đã xóa mềm
router.put("/restore/:id", couponController.restoreCoupon);

module.exports = router;
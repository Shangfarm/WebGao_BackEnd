const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

//Lấy danh sách mã giảm giá (có thể public hoặc yêu cầu login)
router.get("/", couponController.getAllCoupons);

//Lấy mã giảm giá theo ID
router.get("/:id", couponController.getCouponById);

//Tạo mới mã giảm giá – Chỉ admin
router.post("/", verifyToken, requireAdmin, couponController.createCoupon);

//Cập nhật mã giảm giá – Chỉ admin
router.put("/:id", verifyToken, requireAdmin, couponController.updateCoupon);

//Xóa mềm mã giảm giá – Chỉ admin
router.delete("/:id", verifyToken, requireAdmin, couponController.softDeleteCoupon);

//Khôi phục mã giảm giá – Chỉ admin
router.put("/restore/:id", verifyToken, requireAdmin, couponController.restoreCoupon);

module.exports = router;

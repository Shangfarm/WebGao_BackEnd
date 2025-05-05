const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotion.controller");

// Lấy danh sách tất cả khuyến mãi
router.get("/", promotionController.getPromotion); 

// Lấy danh sách tất cả khuyến mãi đang được áp dụng
router.get("/active", promotionController.getActivePromotions);

// Tạo khuyến mãi mới
router.post("/", promotionController.createPromotion);

 // Cập nhật khuyến mãi 
router.put("/:id", promotionController.updatePromotion);

// Xóa mềm khuyến mãi 
router.delete("/:id", promotionController.softDeletePromotion);

// Khôi phục khuyến mãi 
router.put("/restore/:id", promotionController.restorePromotion);

 // Xóa khuyến mãi
router.delete("/delete/:id", promotionController.deletePromotion);

module.exports = router;
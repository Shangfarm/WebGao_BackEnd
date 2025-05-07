const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotion.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

//Lấy danh sách tất cả khuyến mãi – public
router.get("/", promotionController.getPromotion); 

//Lấy tất cả khuyến mãi đang được áp dụng – public
router.get("/active", promotionController.getActivePromotions);

//Tạo khuyến mãi mới – chỉ admin
router.post("/", verifyToken, requireAdmin, promotionController.createPromotion);

//Cập nhật khuyến mãi – chỉ admin
router.put("/:id", verifyToken, requireAdmin, promotionController.updatePromotion);

//Xóa mềm khuyến mãi – chỉ admin
router.delete("/:id", verifyToken, requireAdmin, promotionController.softDeletePromotion);

//Khôi phục khuyến mãi – chỉ admin
router.put("/restore/:id", verifyToken, requireAdmin, promotionController.restorePromotion);

//Xóa vĩnh viễn khuyến mãi – chỉ admin
router.delete("/delete/:id", verifyToken, requireAdmin, promotionController.deletePromotion);

module.exports = router;

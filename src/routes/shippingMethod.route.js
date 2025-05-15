const express = require("express");
const router = express.Router();
const shippingMethodController = require("../controllers/shippingMethod.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

//Lọc, tìm kiếm, phân trang phương thức vận chuyển – Public
router.get("/", shippingMethodController.getShippingMethod);

//Lấy phương thức vận chuyển theo ID – Public
router.get("/:id", shippingMethodController.getShippingMethodById);

//Tạo mới phương thức vận chuyển – Admin
router.post("/", verifyToken, requireAdmin, shippingMethodController.createShippingMethod);

//Cập nhật phương thức vận chuyển – Admin
router.put("/:id", verifyToken, requireAdmin, shippingMethodController.updateShippingMethod);

//Xóa mềm phương thức vận chuyển – Admin
router.delete("/:id", verifyToken, requireAdmin, shippingMethodController.softDeleteShippingMethod);

//Khôi phục – Admin
router.patch("/:id/restore", verifyToken, requireAdmin, shippingMethodController.restoreShippingMethod);

//Xóa vĩnh viễn – Admin
router.delete("/delete/:id", verifyToken, requireAdmin, shippingMethodController.deleteShippingMethod);

module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware')

//Thống kê tình trạng sản phẩm (còn hàng / hết hàng)
router.get("/stock-status", productController.getStockStatus);

//Thống kê sản phẩm theo danh mục
router.get("/category", productController.getProductCountByCategory);

//Lấy danh sách sản phẩm
router.get("/", productController.getProducts);

//Lấy chi tiết sản phẩm
router.get("/:id", productController.getProductById);

//Tạo mới sản phẩm – Chỉ admin
router.post("/", verifyToken, requireAdmin, productController.createProduct);

//Cập nhật sản phẩm – Chỉ admin
router.put("/:id", verifyToken, requireAdmin, productController.updateProduct);

//Xóa mềm sản phẩm – Chỉ admin
router.delete("/:id", verifyToken, requireAdmin, productController.softDeleteProduct);

//Khôi phục sản phẩm đã xóa mềm – Chỉ admin
router.put("/restore/:id", verifyToken, requireAdmin, productController.restoreProduct);

module.exports = router;

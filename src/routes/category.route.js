const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

//Lấy tất cả danh mục – Public
router.get("/", categoryController.getCategories);

//Lấy chi tiết danh mục – Public
router.get("/:id", categoryController.getCategoryById);

//Tạo mới danh mục – Chỉ admin
router.post("/", verifyToken, requireAdmin, categoryController.createCategory);

//Cập nhật danh mục – Chỉ admin
router.put("/:id", verifyToken, requireAdmin, categoryController.updateCategory);

//Xóa mềm danh mục – Chỉ admin
router.delete("/:id", verifyToken, requireAdmin, categoryController.softDeleteCategory);

//Xóa vĩnh viễn danh mục – Chỉ admin
router.delete("/delete/:id", verifyToken, requireAdmin, categoryController.deleteCategory);

//Khôi phục danh mục – Chỉ admin
router.put("/restore/:id", verifyToken, requireAdmin, categoryController.restoreCategory);

module.exports = router;

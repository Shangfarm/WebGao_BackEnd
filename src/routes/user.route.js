const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

//Route: Người dùng lấy thông tin cá nhân
router.get("/me", verifyToken, userController.getMe);

//Route: Người dùng cập nhật thông tin cá nhân
router.put("/update-me", verifyToken, userController.updateMe);

//Route: Thống kê người dùng mới – Chỉ admin
router.get("/new-users", verifyToken, requireAdmin, userController.getRegistrationStats);

//Route: Lấy danh sách người dùng – Chỉ admin
router.get("/", verifyToken, requireAdmin, userController.getUsers);

//Route: Lấy người dùng theo ID – Chỉ admin
router.get("/:id", verifyToken, requireAdmin, userController.getUserById);

//Route: Tạo mới người dùng (chỉ admin tạo nếu dùng nội bộ)
router.post("/", verifyToken, requireAdmin, userController.createUser);

//Route: Admin cập nhật user
router.put("/:id", verifyToken, requireAdmin, userController.updateUser);

//Route: Xóa mềm user – Chỉ admin
router.delete("/:id", verifyToken, requireAdmin, userController.softDeleteUser);

//Route: Khôi phục user – Chỉ admin
router.put("/restore/:id", verifyToken, requireAdmin, userController.restoreUser);

module.exports = router;

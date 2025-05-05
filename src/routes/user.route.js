const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const { getMe, updateMe } = require("../controllers/user.controller");
const jwt = require("jsonwebtoken");

// Middleware xác thực
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, "secret123");
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

// 💥 PHẢI đặt các route đặc biệt lên trước
router.get('/me', authMiddleware, getMe);
router.put('/update-me', authMiddleware, updateMe);



// Route: Lấy danh sách người dùng mới nhất
router.get("/new-users", userController.getRegistrationStats);

// Route lấy danh sách người dùng với phân trang, tìm kiếm, và lọc
router.get("/", userController.getUsers);

// Route: Lấy người dùng theo ID
router.get("/:id", userController.getUserById);

// Route: Tạo mới một người dùng
router.post("/", userController.createUser);

// Route: Cập nhật thông tin người dùng
router.put("/:id", userController.updateUser);

// Route: Đánh dấu người dùng là đã xóa mềm
router.delete("/:id", userController.softDeleteUser);

// Route: Khôi phục người dùng đã xóa
router.put("/restore/:id", userController.restoreUser);

module.exports = router;
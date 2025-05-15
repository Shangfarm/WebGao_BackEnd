const userService = require("../services/user.service");
const User = require("../models/UserModel");

// Lấy tất cả người dùng chưa bị xóa
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
    
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tạo mới một người dùng
const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({ message: "Người dùng đã được tạo thành công", data: newUser });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Cập nhật người dùng với runValidators: true
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // Bật kiểm tra ràng buộc schema
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ message: "Người dùng đã được cập nhật", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Đánh dấu người dùng là đã xóa mềm (Soft Delete)
const softDeleteUser = async (req, res) => {
  try {
    const user = await userService.softDeleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Người dùng đã được đánh dấu là đã xóa mềm" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục người dùng đã xóa
const restoreUser = async (req, res) => {
  try {
    const user = await userService.restoreUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Người dùng đã được khôi phục" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh sách người dùng với phân trang, tìm kiếm, và lọc
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null }; // Chỉ lấy người dùng chưa bị xóa mềm

    // Tìm kiếm theo tên hoặc email
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên
        { email: { $regex: search, $options: "i" } },    // Tìm kiếm theo email
      ];
    }

    // Lọc theo vai trò (role)
    if (role) {
      filter.role = role; // Ví dụ: "admin" hoặc "user"
    }

    // Lọc theo trạng thái (status)
    if (status) {
      filter.status = status === "active"; // "active" -> true, "inactive" -> false
    }

    // Lấy danh sách người dùng với phân trang
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      message: "Danh sách người dùng",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thống kê user đăng ký mới
const getRegistrationStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const stats = await userService.getRegistrationStats(startDate, endDate, groupBy);
    res.status(200).json({ message: "Thống kê người dùng đăng ký mới", data: stats });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Không xác thực được người dùng" });
    }

    const { fullName, username, email, phoneNumber, avatar } = req.body;

    console.log("🔧 Dữ liệu nhận:", { fullName, username, email, phoneNumber });

    if (avatar) {
      console.log("🖼️ Avatar length:", avatar.length);
      if (!avatar.startsWith("data:image")) {
        return res.status(400).json({ message: "Ảnh đại diện không hợp lệ" });
      }
    }

    const updateFields = {
      fullName,
      username,
      email
    };

    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (avatar) updateFields.avatar = avatar;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Cập nhật thành công", user: updated });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật user:");
    console.error("➡️ Message:", err.message);
    console.error("➡️ Stack:", err.stack);
  
    if (err.name === "ValidationError") {
      const errorMessages = {};
      for (const field in err.errors) {
        errorMessages[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errorMessages });
    }
  }    
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
  restoreUser,
  getUsers,
  getRegistrationStats,
  getMe,
  updateMe,
};
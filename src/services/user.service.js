const User = require("../models/UserModel");

// Lấy tất cả người dùng chưa bị xóa
const getAllUsers = async () => {
  return await User.findActive(); // Sử dụng phương thức tĩnh findActive
};

// Lấy người dùng theo ID
const getUserById = async (id) => {
  return await User.findById(id);
};

// Tạo mới một người dùng
const createUser = async (data) => {
  const newUser = new User(data);
  return await newUser.save();
};

// Cập nhật thông tin người dùng
const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// Đánh dấu người dùng là đã xóa
const softDeleteUser = async (id) => {
  const user = await User.findById(id);
  if (user) {
    await user.softDelete(); // Gọi phương thức softDelete
  }
  return user;
};

// Khôi phục người dùng đã xóa
const restoreUser = async (id) => {
  const user = await User.findById(id);
  if (user) {
    await user.restore(); // Gọi phương thức restore
  }
  return user;
};

// Thống kê số lượng user đăng ký mới theo ngày/tháng/năm
const getRegistrationStats = async (startDate, endDate, groupBy = "day") => {
  const filter = { deletedAt: null }; // Chỉ tính user chưa bị xóa mềm

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  let dateFormat;
  if (groupBy === "day") {
    dateFormat = "%Y-%m-%d";
  } else if (groupBy === "month") {
    dateFormat = "%Y-%m";
  } else if (groupBy === "year") {
    dateFormat = "%Y";
  } else {
    dateFormat = "%Y-%m-%d"; // Mặc định theo ngày
  }

  const stats = await User.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return stats;
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
  restoreUser,
  getRegistrationStats,
};
const Coupon = require("../models/CouponModel"); // Import model Coupon
const couponService = require("../services/coupon.service");

// Lấy tất cả mã giảm giá
const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, expiryDate } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null }; // Chỉ lấy mã giảm giá chưa bị xóa mềm

    // Tìm kiếm theo tên hoặc mã code
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên
        { code: { $regex: search, $options: "i" } }, // Tìm kiếm theo mã code
      ];
    }

    // Lọc theo trạng thái
    if (status) {
      filter.status = status === "true";
    }

    // Lọc theo ngày hết hạn
    if (expiryDate) {
      filter.expiryDate = { $gte: new Date(expiryDate) }; // Chỉ lấy mã giảm giá còn hiệu lực
    }

    // Lấy danh sách mã giảm giá với phân trang
    const coupons = await Coupon.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    // Tổng số lượng mã giảm giá
    const total = await Coupon.countDocuments(filter);

    res.status(200).json({
      message: "Danh sách mã giảm giá",
      data: coupons,
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

// Lấy mã giảm giá theo ID
const getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tạo mới một mã giảm giá
const createCoupon = async (req, res) => {
  try {
    const newCoupon = await couponService.createCoupon(req.body);
    res.status(201).json({ message: "Mã giảm giá đã được tạo thành công", data: newCoupon });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật mã giảm giá
const updateCoupon = async (req, res) => {
  try {
    const updatedCoupon = await couponService.updateCoupon(req.params.id, req.body);
    if (!updatedCoupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa mềm mã giảm giá
const softDeleteCoupon = async (req, res) => {
  try {
    const coupon = await couponService.softDeleteCoupon(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
    res.json({ message: "Mã giảm giá đã được đánh dấu là đã xóa" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục mã giảm giá đã xóa
const restoreCoupon = async (req, res) => {
  try {
    const coupon = await couponService.restoreCoupon(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
    res.json({ message: "Mã giảm giá đã được khôi phục" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  softDeleteCoupon,
  restoreCoupon,
};
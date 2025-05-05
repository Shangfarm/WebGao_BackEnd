const Coupon = require("../models/CouponModel");

// Lấy tất cả mã giảm giá
const getAllCoupons = async () => {
  return await Coupon.find();
};

// Lấy mã giảm giá theo ID
const getCouponById = async (id) => {
  return await Coupon.findById(id);
};

// Tạo mới một mã giảm giá
const createCoupon = async (data) => {
  const newCoupon = new Coupon(data);
  return await newCoupon.save();
};

// Cập nhật mã giảm giá
const updateCoupon = async (id, data) => {
  return await Coupon.findByIdAndUpdate(id, data, { new: true });
};

// Xóa mềm mã giảm giá
const softDeleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (coupon) {
    coupon.deletedAt = new Date();
    await coupon.save();
  }
  return coupon;
};

// Khôi phục mã giảm giá đã xóa
const restoreCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (coupon) {
    coupon.deletedAt = null;
    await coupon.save();
  }
  return coupon;
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  softDeleteCoupon,
  restoreCoupon,
};
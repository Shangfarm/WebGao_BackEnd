const Order = require("../models/OrderModel");
const OrderItem = require("../models/OrderItemModel");
const Coupon = require("../models/CouponModel");
const ShippingMethod = require("../models/ShippingMethodModel");
const { applyAutoPromotion } = require("./promotion.service");

// Lấy tất cả đơn hàng
const getAllOrders = async () => {
  return await Order.find()
    .populate("userId", "username email")
    .populate("couponId", "code discount")
    .populate("shippingMethodId", "name price estimatedDeliveryTime");
};

// Lấy đơn hàng theo ID
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("userId", "username email")
    .populate("couponId", "code discountValue discountType")
    .populate("shippingMethodId", "name price estimatedDeliveryTime");

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Tính tổng chi phí đơn hàng (tiền mua hàng + phí vận chuyển)
  const totalCost = order.totalAmount + (order.shippingMethodId?.price || 0);

  return {
    ...order._doc,
    totalCost, // Thêm tổng chi phí vào kết quả trả về
  };
};

// Tạo mới một đơn hàng
const createOrder = async (data) => {
  const newOrder = new Order(data); // `data` bao gồm cả `userName`
  return await newOrder.save();
};

// Cập nhật đơn hàng
const updateOrder = async (id, data) => {
  return await Order.findByIdAndUpdate(id, data, { new: true });
};

// Xóa mềm đơn hàng
const softDeleteOrder = async (id) => {
  const order = await Order.findById(id);
  if (order) {
    order.deletedAt = new Date();
    await order.save();
  }
  return order;
};

// Khôi phục đơn hàng đã xóa mềm
const restoreOrder = async (id) => {
  const order = await Order.findById(id);
  if (order) {
    order.deletedAt = null;
    await order.save();
  }
  return order;
};

// Tính tổng tiền đơn hàng (bao gồm mã giảm giá và phí vận chuyển)
const calculateTotalAmount = async (orderId, couponId) => {
  // Lấy danh sách sản phẩm trong đơn hàng
  const orderItems = await OrderItem.find({ orderId });

  if (!orderItems || orderItems.length === 0) {
    throw new Error("Đơn hàng không có sản phẩm nào");
  }

  // Tính tổng giá trị sản phẩm
  const totalItemAmount = orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  let totalAmount = totalItemAmount;
let appliedPromotion = null;

// Áp dụng tự động chương trình khuyến mãi nếu không dùng coupon
if (!couponId) {
  const promotionResult = await applyAutoPromotion(totalItemAmount);
  totalAmount = promotionResult.totalAfterDiscount;
  appliedPromotion = promotionResult.appliedPromotion;
}


  // Áp dụng mã giảm giá nếu có
  if (couponId) {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    if (coupon.isExpired()) {
      throw new Error("Mã giảm giá đã hết hạn");
    }

    if (coupon.quantity <= 0) {
      throw new Error("Mã giảm giá đã hết số lượng sử dụng");
    }

    if (coupon.discountType === "percentage") {
      const discount = (totalItemAmount * coupon.discountValue) / 100;
      totalAmount -= coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    } else if (coupon.discountType === "fixed") {
      totalAmount -= coupon.discountValue;
    }

    // Đảm bảo tổng giá trị không âm
    totalAmount = Math.max(totalAmount, 0);

    // Giảm số lượng mã giảm giá
    coupon.quantity -= 1;
    await coupon.save();
  }

  return { totalAmount, appliedPromotion };
};

// Kiểm tra trạng thái sản phẩm trong giỏ hàng
const checkProductStatusByCart = async (userId) => {
  const cartItems = await CartItem.find({ userId }).populate("productId", "name status");

  const inactiveItems = cartItems.filter(item => !item.productId.status);

  if (inactiveItems.length > 0) {
    const names = inactiveItems.map(item => item.productId.name).join(", ");
    throw new Error(`Các sản phẩm sau đã ngừng bán: ${names}`);
  }
};

// Thống kê doanh thu 
const getRevenueStats = async (startDate, endDate, groupBy = "day") => {
  const filter = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
    // Loại bỏ các đơn hàng đã CANCELLED
    filter.orderStatus = { $ne: 'CANCELLED' };

  let dateFormat;
  if (groupBy === "day") {
    dateFormat = "%Y-%m-%d"; // Nhóm theo ngày
  } else if (groupBy === "month") {
    dateFormat = "%Y-%m";    // Nhóm theo tháng
  } else if (groupBy === "year") {
    dateFormat = "%Y";       // Nhóm theo năm
  } else {
    dateFormat = "%Y-%m-%d"; // Mặc định nếu không đúng thì theo ngày
  }

  const revenueStats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        totalRevenue: { $sum: "$totalAmount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return revenueStats;
};

// Thống kê số lượng đơn hàng
const getOrderStats = async () => {
  const orderStats = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } }, // Nhóm theo trạng thái đơn hàng
  ]);
  return orderStats;
};

// Thống kê các đơn hàng mới nhất
const getRecentOrders = async (limit = 5) => {
  const recentOrders = await Order.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username email")
    .populate("couponId", "code discountType discountValue")
    .populate("shippingMethodId", "name price");
    
  return recentOrders;
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  softDeleteOrder,
  restoreOrder,
  calculateTotalAmount,
  getRevenueStats,
  getOrderStats,
  checkProductStatusByCart,
  getRecentOrders,
};
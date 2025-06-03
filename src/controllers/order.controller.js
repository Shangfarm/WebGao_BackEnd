const orderService = require("../services/order.service");
const Order = require("../models/OrderModel");
const CartItem = require("../models/CartItemModel");
const OrderItem = require("../models/OrderItemModel"); // Import OrderItem nếu cần
const Coupon = require("../models/CouponModel"); // Import model Coupon
const ShippingMethod = require("../models/ShippingMethodModel"); // Import ShippingMethod
const Promotion = require("../models/PromotionModel"); // Import PromotionModel
const promotionService = require("../services/promotion.service");
const Product = require("../models/ProductModel");

// Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ message: "Danh sách đơn hàng", data: orders });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email")
      .populate("couponId", "code discountType discountValue")
      .populate("promotionId", "name discountType discountValue")
      .populate("shippingMethodId", "name price estimatedDeliveryTime")
      .populate("items.productId", "name price");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const totalCost = order.totalAmount + (order.shippingMethodId?.price || 0);

    res.status(200).json({
      message: "Thông tin đơn hàng",
      data: {
        ...order._doc,
        totalCost,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


// Tạo mới một đơn hàng
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // <-- LẤY TỪ TOKEN ĐÃ ĐĂNG NHẬP, KHÔNG LẤY TỪ BODY
    const { userName, shippingAddress, shippingMethodId, paymentMethod, couponId } = req.body;

    if (!userName || !shippingAddress || !shippingMethodId || !paymentMethod) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc để tạo đơn hàng" });
    }

    const cartItems = await CartItem.find({ userId }).populate("productId");
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const inactiveProducts = cartItems.filter(item => !item.productId.status);
    if (inactiveProducts.length > 0) {
      const productNames = inactiveProducts.map(item => item.productId.name).join(", ");
      return res.status(400).json({ message: `Các sản phẩm sau đã ngừng bán: ${productNames}` });
    }

    // Tính tạm tính dựa theo giá đã giảm
const productTotal = cartItems.reduce((sum, item) => {
  const discount = item.productId.discount || 0;
  const discountedPrice = Math.round(item.productId.price * (1 - discount / 100));
  return sum + discountedPrice * item.quantity;
}, 0);

const totalCost = productTotal;
let totalAmount = productTotal;
let appliedPromotion = null;
// Bước 1: Áp dụng khuyến mãi toàn giỏ
if (req.body.promotionId) {
  const promotion = await Promotion.findById(req.body.promotionId);
  if (promotion && promotion.status) {
    appliedPromotion = promotion;

    if (promotion.discountType === "percentage") {
  totalAmount -= productTotal * (promotion.discountValue / 100);
    } else if (promotion.discountType === "fixed") {
      totalAmount -= promotion.discountValue;
    }
  }
}
totalAmount = Math.max(totalAmount, 0);

// Lấy phí vận chuyển
const shippingMethod = await ShippingMethod.findById(shippingMethodId);
if (!shippingMethod) {
  return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ" });
}
const shippingFee = shippingMethod.price;

// Bước 2: Cộng phí vận chuyển
totalAmount += shippingFee;

// Bước 3: Áp dụng mã giảm giá nếu có
if (couponId) {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return res.status(400).json({ message: "Mã giảm giá không hợp lệ" });
  if (!coupon.status) return res.status(400).json({ message: "Mã giảm giá đã bị khóa" });
  if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
  if (coupon.quantity <= 0) return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });

  if (coupon.discountType === "percentage") {
    totalAmount -= totalAmount * (coupon.discountValue / 100);
  } else if (coupon.discountType === "fixed") {
    totalAmount -= coupon.discountValue;
  }

  totalAmount = Math.max(totalAmount, 0);
  coupon.quantity -= 1;
  await coupon.save();
}

totalAmount = Math.round(totalAmount); // ✅ sau tất cả mới làm tròn


    // Chuẩn bị dữ liệu sản phẩm
    const items = cartItems.map(item => {
      const product = item.productId;
      const discount = product.discount || 0;
      const discountedPrice = Math.round(product.price * (1 - discount / 100));
      return {
        productId: product._id,
        quantity: item.quantity,
        price: discountedPrice,
      };
    });

    // Tạo đơn hàng
    const newOrder = new Order({
      userId,
      userName,
      shippingAddress,
      shippingMethodId,
      paymentMethod,
      couponId: couponId || null,
      promotionId: appliedPromotion?._id || null,
      totalAmount,
      totalCost,
      orderStatus: "PENDING",
      items,
    });

    await newOrder.save();

    // Tạo các OrderItem riêng
    const orderItems = cartItems.map(item => {
      const product = item.productId;
      const discount = product.discount || 0;
      const discountedPrice = Math.round(product.price * (1 - discount / 100));
      return {
        orderId: newOrder._id,
        productId: product._id,
        quantity: item.quantity,
        price: discountedPrice,
      };
    });

    await OrderItem.insertMany(orderItems);

    // Trừ tồn kho
    for (const item of cartItems) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng trong kho` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Xóa giỏ hàng
    await CartItem.deleteMany({ userId });

    res.status(201).json({ message: "Đơn hàng đã được tạo thành công", data: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


// Cập nhật đơn hàng
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID đơn hàng từ URL
    const { couponId, shippingMethodId, orderStatus } = req.body; // Lấy mã giảm giá và phương thức vận chuyển từ body
    let updateData = { ...req.body }; // Dữ liệu cần cập nhật

    // Lấy thông tin đơn hàng hiện tại
    const existingOrder = await Order.findById(id)
          .populate("couponId shippingMethodId")
          .populate("items.productId"); 

    if (!existingOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra nếu trạng thái đơn hàng là CANCELLED, hoàn lại stock
    if (orderStatus === "CANCELLED" && existingOrder.orderStatus !== "CANCELLED") {
      const orderItems = await OrderItem.find({ orderId: id }); // <<== Lấy sản phẩm từ bảng OrderItem
    
      for (const item of orderItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }
    

    // Tính toán lại tổng tiền nếu có mã giảm giá hoặc phương thức vận chuyển mới
    if (couponId || shippingMethodId) {
      let totalAmount = existingOrder.totalAmount;

      // Lấy phí vận chuyển mới (nếu có)
      if (shippingMethodId) {
        const shippingMethod = await ShippingMethod.findById(shippingMethodId);
        if (!shippingMethod) {
          return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ" });
        }
        totalAmount = totalAmount - existingOrder.shippingMethodId.price + shippingMethod.price;
        updateData.shippingMethodId = shippingMethodId;
      }

      // Áp dụng mã giảm giá mới (nếu có)
      if (couponId) {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
          return res.status(400).json({ message: "Mã giảm giá không hợp lệ" });
        }

        // Kiểm tra ngày hết hạn của mã giảm giá
        if (new Date(coupon.expiryDate) < new Date()) {
          return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
        }

        // Kiểm tra số lượng mã giảm giá còn lại
        if (coupon.quantity <= 0) {
          return res.status(400).json({ message: "Mã giảm giá đã được sử dụng hết" });
        }

        // Nếu cần, kích hoạt lại mã giảm giá
        if (!coupon.status) {
          coupon.status = true;
          await coupon.save();
        }

        // Áp dụng giảm giá
        if (coupon.discountType === "percentage") {
          totalAmount -= (totalAmount * coupon.discountValue) / 100;
        } else if (coupon.discountType === "fixed") {
          totalAmount -= coupon.discountValue;
        }

        // Đảm bảo tổng tiền không âm
        totalAmount = Math.max(totalAmount, 0);

        // Giảm số lượng mã giảm giá
        coupon.quantity -= 1;
        await coupon.save();

        updateData.couponId = couponId;
      }

      // Cập nhật tổng tiền
      updateData.totalAmount = totalAmount;
    }

    // Cập nhật đơn hàng
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({ message: "Đơn hàng đã được cập nhật", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa đơn hàng (soft delete)
const softDeleteOrder = async (req, res) => {
  try {
    const order = await orderService.softDeleteOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    res.status(200).json({ message: "Đơn hàng đã được đánh dấu là đã xóa" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục đơn hàng đã xóa
const restoreOrder = async (req, res) => {
  try {
    const order = await orderService.restoreOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    res.status(200).json({ message: "Đơn hàng đã được khôi phục" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật trạng thái vận chuyển
const updateShippingStatus = async (req, res) => {
  try {
    const { shippingStatus } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!shippingStatus) {
      return res.status(400).json({ message: "Trạng thái vận chuyển là bắt buộc" });
    }

    // Cập nhật trạng thái vận chuyển
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { shippingStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({ message: "Trạng thái vận chuyển đã được cập nhật", data: order });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 0, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Lọc theo trạng thái xóa mềm
    const filter = { deletedAt: null }; // Chỉ lấy các đơn hàng chưa bị xóa mềm

    // Nếu không phải admin thì chỉ lấy đơn của chính user đó
    if (req.user.role !== 'admin') {
      filter.userId = req.user.userId;
    }

    // Lọc theo trạng thái đơn hàng
    if (status) {
      filter.orderStatus = status;
    }

    // Tìm kiếm theo tên người dùng hoặc mã đơn hàng
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên người dùng
        { _id: search.length === 24 ? search : undefined }, // Tìm kiếm chính xác theo _id
      ].filter(Boolean); // Loại bỏ các điều kiện không hợp lệ
    }

    // Lấy danh sách đơn hàng với phân trang
    const orders = await Order.find(filter)
      .populate("userId", "username email") // Populate thông tin người dùng
      .populate("couponId", "code discountType discountValue") // Populate thông tin mã giảm giá
      .populate("shippingMethodId", "name price") // Populate thông tin phương thức vận chuyển
      .skip(skip)
      .limit(parseInt(limit));

    // Loại bỏ trường `items` khỏi từng đơn hàng
    const sanitizedOrders = orders.map((order) => {
      const { items, ...rest } = order.toObject(); // Xóa `items` khỏi kết quả
      return rest;
    });

    // Tổng số lượng đơn hàng
    const total = await Order.countDocuments(filter);

    // Trả về kết quả
    res.status(200).json({
      message: "Danh sách đơn hàng",
      data: sanitizedOrders, // Trả về danh sách đơn hàng đã loại bỏ `items`
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

// Thống kê doanh thu 
const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;  // Lấy thêm groupBy từ query
    console.log("Start Date:", startDate, "End Date:", endDate, "GroupBy:", groupBy);  // Log tham số ngày và kiểu nhóm

    const revenueStats = await orderService.getRevenueStats(startDate, endDate, groupBy);  // Gọi service có truyền groupBy

    res.status(200).json({ message: "Thống kê doanh thu", data: revenueStats });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};



// Thống kê số lượng đơn hàng
const getOrderStats = async (req, res) => {
  try {
    const orderStats = await orderService.getOrderStats();
    res.status(200).json({ message: "Thống kê số lượng đơn hàng", data: orderStats });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thống kê lấy danh sách đơn hàng mới nhất
const getRecentOrders = async (req, res) => {
  try {
    const { limit } = req.query;
    const recentOrders = await orderService.getRecentOrders(limit ? parseInt(limit) : 5);
    res.status(200).json({ message: "Danh sách đơn hàng mới nhất", data: recentOrders });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// ✅ Đặt đúng vị trí ở trên trước khi export
const updateOrderAfterMomo = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Cập nhật đơn hàng thành công", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật đơn hàng", error: err.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  softDeleteOrder,
  restoreOrder,
  updateShippingStatus,
  getOrders,
  getRevenueStats,
  getOrderStats,
  getRecentOrders,
  updateOrderAfterMomo, 
};

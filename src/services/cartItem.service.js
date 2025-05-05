const CartItem = require("../models/CartItemModel");
const Product = require("../models/ProductModel");

// Lấy tất cả sản phẩm trong giỏ hàng của người dùng
const getAllCartItems = async (userId) => {
  return await CartItem.find({ userId }).populate("productId", "name price");
};

// Lấy một sản phẩm trong giỏ hàng theo ID
const getCartItemById = async (id) => {
  return await CartItem.findById(id).populate("productId", "name price");
};

// Lấy sản phẩm trong giỏ hàng theo userId và productId
const getCartItemByUserAndProduct = async (userId, productId) => {
  return await CartItem.findOne({ userId, productId }).populate("productId");
};

// Thêm sản phẩm vào giỏ hàng
const addCartItem = async (data) => {
  const product = await Product.findById(data.productId);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }
  if (product.stock < data.quantity) {
    throw new Error("Số lượng sản phẩm không đủ");
  }

  const existingCartItem = await CartItem.findOne({
    userId: data.userId,
    productId: data.productId,
  });

  if (existingCartItem) {
    // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
    existingCartItem.quantity += data.quantity;
    return await existingCartItem.save();
  }

  // Nếu sản phẩm chưa tồn tại, thêm mới
  const newCartItem = new CartItem(data);
  return await newCartItem.save();
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (id, data) => {
  return await CartItem.findByIdAndUpdate(id, data, { new: true });
};

// Xóa sản phẩm khỏi giỏ hàng
const deleteCartItem = async (id) => {
  return await CartItem.findByIdAndDelete(id);
};

const calculateCartTotal = async (userId) => {
  // Lấy tất cả sản phẩm trong giỏ hàng của người dùng
  const cartItems = await CartItem.find({ userId });

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // Tính tổng giá trị giỏ hàng dựa trên trường `totalPrice`
  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return total;
};

module.exports = {
  getAllCartItems,
  getCartItemById,
  getCartItemByUserAndProduct,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  calculateCartTotal,
};
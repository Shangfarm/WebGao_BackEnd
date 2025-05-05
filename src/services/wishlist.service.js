const Wishlist = require("../models/WishlistModel");

// Lấy danh sách yêu thích của người dùng
const getWishlist = async (userId) => {
  return await Wishlist.find({ userId });
};

// Thêm sản phẩm vào danh sách yêu thích
const addToWishlist = async (userId, productId) => {
  const existingItem = await Wishlist.findOne({ userId, productId });
  if (existingItem) {
    throw new Error("Sản phẩm đã có trong danh sách yêu thích");
  }

  const wishlistItem = new Wishlist({ userId, productId });
  return await wishlistItem.save();
};

// Xóa mềm sản phẩm khỏi danh sách yêu thích
const softDeleteWishlistItem = async (id) => {
  return await Wishlist.findByIdAndUpdate(id, { deletedAt: new Date() });
};

// Khôi phục sản phẩm đã xóa mềm
const restoreWishlistItem = async (id) => {
  return await Wishlist.findByIdAndUpdate(id, { deletedAt: null });
};

module.exports = {
  getWishlist,
  addToWishlist,
  softDeleteWishlistItem,
  restoreWishlistItem,
};
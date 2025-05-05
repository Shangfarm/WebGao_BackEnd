const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import route
const categoryRoutes = require("./routes/category.route"); 
const productRoutes = require("./routes/product.route");
const userRoutes = require("./routes/user.route");
const orderRoutes = require("./routes/order.route");
const couponRoutes = require("./routes/coupon.route");
const orderItemRoutes = require("./routes/orderItem.route");
const cartItemRoutes = require("./routes/cartItem.route");
const otpRoutes = require("./routes/otp.route");
const wishlistRoutes = require("./routes/wishlist.route");
const reviewRoutes = require("./routes/review.route");
const shippingMethodRoutes = require("./routes/shippingMethod.route");
const promotionRoutes = require("./routes/promotion.route");
const authRoutes = require('./routes/auth.route')

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/webgao";

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // ✅ Fix lỗi 413
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // ✅ Nếu có xài form

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Sử dụng route
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/shipping-methods", shippingMethodRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/dashboard", orderRoutes);
app.use("/api/auth", authRoutes);

// Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

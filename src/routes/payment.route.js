const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Tạo đơn thanh toán MoMo
router.post('/create', paymentController.createPaymentOrder);

// Nhận callback từ MoMo (IPN - Instant Payment Notification)
router.post('/notify', paymentController.handleMoMoNotify);

module.exports = router;

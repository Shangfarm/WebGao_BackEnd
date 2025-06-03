const paymentService = require('../services/payment.service');

exports.createPaymentOrder = async (req, res) => {
  try {
    const { userId, amount, shippingMethodId } = req.body;

    // Kiểm tra đủ thông tin
    if (!userId || !amount || !shippingMethodId) {
      return res.status(400).json({
        message: 'Thiếu userId, amount hoặc shippingMethodId'
      });
    }

    const result = await paymentService.createPaymentOrder(userId, amount, shippingMethodId);

    res.status(200).json({
      message: 'Tạo đơn thanh toán thành công',
      data: result
    });
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi tạo đơn thanh toán MoMo',
      error: err.message
    });
  }
};

exports.handleMoMoNotify = async (req, res) => {
  try {
    await paymentService.handleMoMoNotify(req.body);
    res.status(200).json({ message: 'Xử lý IPN thành công' });
  } catch (err) {
    res.status(400).json({
      message: 'Xử lý IPN thất bại',
      error: err.message
    });
  }
};

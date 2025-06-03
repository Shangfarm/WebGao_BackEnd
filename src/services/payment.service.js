const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/OrderModel');
const { MOMO_CONFIG } = require('../config/momo.config');

// Tạo chữ ký MoMo
function generateSignature(params, secretKey) {
  const rawSignature =
    "accessKey=" + params.accessKey +
    "&amount=" + params.amount +
    "&extraData=" + params.extraData +
    "&ipnUrl=" + params.ipnUrl +
    "&orderId=" + params.orderId +
    "&orderInfo=" + params.orderInfo +
    "&partnerCode=" + params.partnerCode +
    "&redirectUrl=" + params.redirectUrl +
    "&requestId=" + params.requestId +
    "&requestType=" + params.requestType;

  console.log("🔐 rawSignature:", rawSignature); // ✅ In ra để kiểm tra

  return crypto.createHmac('sha256', secretKey)
               .update(rawSignature)
               .digest('hex');
}


async function createPaymentOrder(userId, amount, shippingMethodId) {
  try {
    const order = new Order({
      userId,
      userName: 'Người dùng TEST',
      totalAmount: amount,
      totalCost: amount,
      paymentMethod: 'MOMO',
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      shippingStatus: 'PROCESSING',
      shippingMethodId,
      shippingAddress: {
        houseNumber: 'N/A',
        ward: 'N/A',
        district: 'N/A',
        city: 'N/A',
        phoneNumber: 'N/A'
      },
      items: []
    });

    const savedOrder = await order.save();
    const requestId = savedOrder._id.toString();
    const orderId = requestId;

    const params = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo: MOMO_CONFIG.ORDER_INFO,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      ipnUrl: MOMO_CONFIG.IPN_URL,
      extraData: userId.toString(),
      requestType: MOMO_CONFIG.REQUEST_TYPE
    };

    const signature = generateSignature(params, MOMO_CONFIG.SECRET_KEY);
    console.log("✅ Signature:", signature);

    const requestBody = {
  partnerCode: params.partnerCode,
  accessKey: params.accessKey,
  requestId: params.requestId,
  amount: params.amount,
  orderId: params.orderId,
  orderInfo: params.orderInfo,
  redirectUrl: params.redirectUrl,
  ipnUrl: params.ipnUrl,
  extraData: params.extraData,
  requestType: params.requestType,
  signature,
  lang: MOMO_CONFIG.LANGUAGE
};


    const momoRes = await axios.post(MOMO_CONFIG.API_URL, requestBody);
    console.log("📤 Request gửi đi:", requestBody);
    console.log("📥 Phản hồi từ MoMo:", momoRes.data);

    if (momoRes.data.resultCode !== 0) {
      throw new Error('Tạo thanh toán MoMo thất bại: ' + momoRes.data.message);
    }

    return {
      payUrl: momoRes.data.payUrl,
      orderId
    };
  } catch (err) {
    throw new Error('Lỗi tạo thanh toán MoMo: ' + err.message);
  }
}


async function handleMoMoNotify(data) {
  const {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    transId,
    resultCode,
    extraData,
    signature
  } = data;

  const rawParams = {
    accessKey,
    amount,
    extraData,
    ipnUrl: MOMO_CONFIG.IPN_URL,
    orderId,
    orderInfo,
    partnerCode,
    redirectUrl: MOMO_CONFIG.REDIRECT_URL,
    requestId,
    requestType: MOMO_CONFIG.REQUEST_TYPE
  };

  const expectedSignature = generateSignature(rawParams, MOMO_CONFIG.SECRET_KEY);

  if (signature !== expectedSignature) {
    throw new Error('Sai chữ ký MoMo');
  }

  const status = resultCode === 0 ? 'PAID' : 'FAILED';

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: status,
    transaction_id: transId,
    payment_intent_id: requestId,
    updatedAt: new Date()
  });
}

module.exports = {
  createPaymentOrder, 
  handleMoMoNotify
};

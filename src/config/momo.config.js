export const MOMO_CONFIG = {
  API_URL: process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE || '',
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
  SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
  IPN_URL: process.env.MOMO_IPN_URL || '',
  REDIRECT_URL: process.env.MOMO_REDIRECT_URL || '',
  ORDER_INFO: process.env.MOMO_ORDER_INFO || 'Thanh toán',
  REQUEST_TYPE: 'captureWallet',
  LANGUAGE: 'vi'
}
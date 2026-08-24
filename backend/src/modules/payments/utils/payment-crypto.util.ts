import * as crypto from 'crypto';

export interface MoMoSignatureParams {
  accessKey: string;
  amount: string | number;
  extraData?: string;
  ipnUrl?: string;
  orderId: string;
  orderInfo?: string;
  partnerCode: string;
  redirectUrl?: string;
  requestId: string;
  requestType?: string;
}

export interface MoMoWebhookSignatureParams {
  accessKey: string;
  amount: string | number;
  extraData?: string;
  message?: string;
  orderId: string;
  orderInfo?: string;
  orderType?: string;
  partnerCode: string;
  payType?: string;
  requestId: string;
  responseTime?: string | number;
  resultCode: string | number;
  transId?: string | number;
}

export const MOMO_SANDBOX_CONFIG = {
  get partnerCode(): string {
    return process.env.MOMO_PARTNER_CODE || 'MOMO_TEST_PARTNER';
  },
  get accessKey(): string {
    return process.env.MOMO_ACCESS_KEY || 'MOMO_TEST_ACCESS_KEY';
  },
  get secretKey(): string {
    return process.env.MOMO_SECRET_KEY || 'MOMO_TEST_SECRET_KEY';
  },
  get endpoint(): string {
    return process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  },
  get redirectUrl(): string {
    return process.env.MOMO_REDIRECT_URL || 'https://trangiafood.vn/payment-return';
  },
  get ipnUrl(): string {
    return process.env.MOMO_IPN_URL || 'https://api.trangiafood.vn/payments/webhook/momo';
  },
};

export const VNPAY_SANDBOX_CONFIG = {
  get vnp_TmnCode(): string {
    return process.env.VNPAY_TMN_CODE || 'TRANGIA01';
  },
  get vnp_HashSecret(): string {
    return process.env.VNPAY_HASH_SECRET || 'VNPAY_SECRET_KEY_TEST';
  },
  get vnp_Url(): string {
    return process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  },
  get vnp_ReturnUrl(): string {
    return process.env.VNPAY_RETURN_URL || 'https://trangiafood.vn/vnpay-return';
  },
};

/**
 * Sinh chữ ký HMAC-SHA256 cho MoMo Payment Request
 */
export function generateMoMoRequestSignature(
  params: MoMoSignatureParams,
  secretKey: string = MOMO_SANDBOX_CONFIG.secretKey,
): string {
  const rawSignature =
    `accessKey=${params.accessKey}` +
    `&amount=${params.amount}` +
    `&extraData=${params.extraData ?? ''}` +
    `&ipnUrl=${params.ipnUrl ?? MOMO_SANDBOX_CONFIG.ipnUrl}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo ?? 'Thanh toan don hang Tran Gia Food'}` +
    `&partnerCode=${params.partnerCode}` +
    `&redirectUrl=${params.redirectUrl ?? MOMO_SANDBOX_CONFIG.redirectUrl}` +
    `&requestId=${params.requestId}` +
    `&requestType=${params.requestType ?? 'captureWallet'}`;

  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

/**
 * Xác thực chữ ký HMAC-SHA256 từ MoMo Webhook IPN
 */
export function verifyMoMoWebhookSignature(
  params: MoMoWebhookSignatureParams,
  signature: string,
  secretKey: string = MOMO_SANDBOX_CONFIG.secretKey,
): boolean {
  if (!signature) return false;

  const rawSignature =
    `accessKey=${params.accessKey}` +
    `&amount=${params.amount}` +
    `&extraData=${params.extraData ?? ''}` +
    `&message=${params.message ?? ''}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo ?? ''}` +
    `&orderType=${params.orderType ?? 'momo_wallet'}` +
    `&partnerCode=${params.partnerCode}` +
    `&payType=${params.payType ?? 'qr'}` +
    `&requestId=${params.requestId}` +
    `&responseTime=${params.responseTime ?? ''}` +
    `&resultCode=${params.resultCode}` +
    `&transId=${params.transId ?? ''}`;

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  try {
    return (
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
    );
  } catch {
    return signature === expectedSignature;
  }
}

/**
 * Sinh VNPay Payment URL với thuật toán HMAC-SHA512 sắp xếp alphabet
 */
export function generateVNPayPaymentUrl(
  params: {
    orderId: string;
    amount: number;
    orderInfo?: string;
    ipAddr?: string;
  },
  config = VNPAY_SANDBOX_CONFIG,
): string {
  const date = new Date();
  const createDate =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo || `Thanh toan don hang ${params.orderId}`,
    vnp_OrderType: 'food',
    vnp_Amount: String(params.amount * 100),
    vnp_ReturnUrl: config.vnp_ReturnUrl,
    vnp_IpAddr: params.ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  const sortedKeys = Object.keys(vnpParams).sort();
  const searchParams = new URLSearchParams();

  for (const key of sortedKeys) {
    searchParams.append(key, vnpParams[key]!);
  }

  const signData = searchParams.toString();
  const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return `${config.vnp_Url}?${signData}&vnp_SecureHash=${signed}`;
}

/**
 * Xác thực Checksum chữ ký số từ VNPay IPN Webhook
 */
export function verifyVNPayWebhookSignature(
  vnpayParams: Record<string, string | number | undefined>,
  hashSecret: string = VNPAY_SANDBOX_CONFIG.vnp_HashSecret,
): boolean {
  const secureHash = vnpayParams['vnp_SecureHash'];
  if (!secureHash || typeof secureHash !== 'string') return false;

  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(vnpayParams)) {
    if (
      key !== 'vnp_SecureHash' &&
      key !== 'vnp_SecureHashType' &&
      value !== undefined &&
      value !== null
    ) {
      filteredParams[key] = String(value);
    }
  }

  const sortedKeys = Object.keys(filteredParams).sort();
  const searchParams = new URLSearchParams();

  for (const key of sortedKeys) {
    searchParams.append(key, filteredParams[key]!);
  }

  const signData = searchParams.toString();
  const hmac = crypto.createHmac('sha512', hashSecret);
  const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  try {
    return (
      secureHash.length === expectedHash.length &&
      crypto.timingSafeEqual(Buffer.from(secureHash, 'hex'), Buffer.from(expectedHash, 'hex'))
    );
  } catch {
    return secureHash.toLowerCase() === expectedHash.toLowerCase();
  }
}

/** Format currency to VNĐ string (e.g. 50000 -> 50.000 đ) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/** Format distance in kilometers (e.g. 2.456 -> 2.5 km) */
export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

/** Truncate long strings with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export interface StatusMeta {
  label: string;
  badgeStatus: 'success' | 'warning' | 'error' | 'default' | 'processing';
  tagColor: string;
}

/** Map eKYC status keys to friendly Vietnamese semantic text & visual colors */
export function mapKycStatus(status: string): StatusMeta {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { label: 'Chờ duyệt eKYC', badgeStatus: 'warning', tagColor: 'warning' };
    case 'APPROVED':
      return { label: 'Đã duyệt eKYC', badgeStatus: 'success', tagColor: 'success' };
    case 'REJECTED':
      return { label: 'Đã từ chối', badgeStatus: 'error', tagColor: 'error' };
    default:
      return { label: status || 'Không xác định', badgeStatus: 'default', tagColor: 'default' };
  }
}

/** Map Shipper status keys to friendly Vietnamese semantic text & visual colors */
export function mapShipperStatus(status: string): StatusMeta {
  switch (status?.toUpperCase()) {
    case 'IDLE':
    case 'ONLINE':
      return { label: 'Đang sẵn sàng nhận đơn', badgeStatus: 'success', tagColor: 'success' };
    case 'DELIVERING':
      return { label: 'Đang giao hàng', badgeStatus: 'warning', tagColor: 'warning' };
    case 'PICKING_UP':
      return { label: 'Đang đến lấy món', badgeStatus: 'processing', tagColor: 'processing' };
    case 'OFFLINE':
      return { label: 'Đã tắt app / Offline', badgeStatus: 'default', tagColor: 'default' };
    default:
      return { label: status || 'Không xác định', badgeStatus: 'default', tagColor: 'default' };
  }
}

/** Map Order status keys to friendly Vietnamese semantic text & visual colors */
export function mapOrderStatus(status: string): StatusMeta {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { label: 'Chờ quán xác nhận', badgeStatus: 'warning', tagColor: 'warning' };
    case 'PREPARING':
      return { label: 'Quán đang chuẩn bị món', badgeStatus: 'processing', tagColor: 'processing' };
    case 'PICKING_UP':
      return { label: 'Tài xế đang lấy món', badgeStatus: 'processing', tagColor: 'cyan' };
    case 'DELIVERING':
      return { label: 'Tài xế đang giao', badgeStatus: 'warning', tagColor: 'orange' };
    case 'COMPLETED':
      return { label: 'Hoàn thành', badgeStatus: 'success', tagColor: 'success' };
    case 'CANCELLED':
      return { label: 'Đã hủy đơn', badgeStatus: 'error', tagColor: 'error' };
    default:
      return { label: status || 'Không xác định', badgeStatus: 'default', tagColor: 'default' };
  }
}

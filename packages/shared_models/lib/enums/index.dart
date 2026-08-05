/// Shared enums for order status
enum OrderStatus {
  pending,
  confirmed,
  pickingUp,
  delivering,
  delivered,
  completed,
  cancelled;

  String get label {
    return switch (this) {
      pending    => 'order.status_pending',
      confirmed  => 'order.status_confirmed',
      pickingUp  => 'order.status_picking_up',
      delivering => 'order.status_delivering',
      delivered  => 'order.status_delivered',
      completed  => 'order.status_completed',
      cancelled  => 'order.status_cancelled',
    };
  }

  bool get isActive =>
      this == pending ||
      this == confirmed ||
      this == pickingUp ||
      this == delivering ||
      this == delivered;
}

enum PaymentMethod { momo, bank, cash }

enum OrderType { delivery, pickup }

enum UserRole { customer, restaurant, shipper, admin }

enum ShipperPenaltyLevel {
  normal,      // 0 - bình thường
  warned,      // 1 - cảnh báo
  deprioritized, // 2 - giảm ưu tiên
  suspended,   // 3 - tạm khóa 7 ngày
  banned,      // 4 - khóa vĩnh viễn
}

enum VoucherType { platform, restaurant, ship }

enum DiscountType { percent, fixed, freeShip, buyXGetY }

# 🗄️ 10 — Database Schema

> **Database:** PostgreSQL (main) + Redis (cache / realtime)

---

## Core Tables

```sql
-- Người dùng (Customer, Restaurant owner, Shipper, Admin)
Users
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  role            ENUM('customer', 'restaurant', 'shipper', 'admin')
  name            VARCHAR(100)
  phone           VARCHAR(20) UNIQUE NOT NULL
  email           VARCHAR(150) UNIQUE
  password_hash   VARCHAR(255)
  address         TEXT
  lat             DECIMAL(10,8)
  lng             DECIMAL(11,8)
  avatar_url      TEXT
  fcm_token       TEXT           -- Firebase push notification token
  is_active       BOOLEAN DEFAULT true
  kyc_status      ENUM('none', 'pending', 'verified', 'rejected')
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Quán ăn
Restaurants
  id              UUID PRIMARY KEY
  owner_id        UUID REFERENCES Users(id)
  name            VARCHAR(150) NOT NULL
  description     TEXT
  address         TEXT NOT NULL
  lat             DECIMAL(10,8) NOT NULL
  lng             DECIMAL(11,8) NOT NULL
  phone           VARCHAR(20)
  cover_image_url TEXT
  radius_km       DECIMAL(5,2) DEFAULT 10.0   -- bán kính phục vụ
  is_open         BOOLEAN DEFAULT false
  opening_hours   JSONB    -- {"mon":{"open":"08:00","close":"22:00"},...}
  is_manual_override BOOLEAN DEFAULT false     -- đóng/mở thủ công
  avg_rating      DECIMAL(3,2) DEFAULT 0
  total_reviews   INT DEFAULT 0
  platform_fee_rate DECIMAL(5,4) DEFAULT 0.20 -- 20% mặc định
  bank_account    JSONB    -- thông tin tài khoản nhận payout
  created_at      TIMESTAMP DEFAULT NOW()

-- Danh mục menu
MenuCategories
  id              UUID PRIMARY KEY
  restaurant_id   UUID REFERENCES Restaurants(id)
  name            VARCHAR(100) NOT NULL
  sort_order      INT DEFAULT 0
  is_active       BOOLEAN DEFAULT true

-- Món ăn
MenuItems
  id              UUID PRIMARY KEY
  category_id     UUID REFERENCES MenuCategories(id)
  name            VARCHAR(150) NOT NULL
  description     TEXT
  price           DECIMAL(12,2) NOT NULL
  image_url       TEXT
  is_available    BOOLEAN DEFAULT true
  sort_order      INT DEFAULT 0

-- Đơn hàng
Orders
  id              UUID PRIMARY KEY
  customer_id     UUID REFERENCES Users(id)
  restaurant_id   UUID REFERENCES Restaurants(id)
  shipper_id      UUID REFERENCES Shippers(id)
  status          ENUM('pending','confirmed','picking_up','delivering',
                       'delivered','completed','cancelled')
  order_type      ENUM('delivery', 'pickup')
  subtotal        DECIMAL(12,2) NOT NULL      -- trước giảm giá
  ship_fee        DECIMAL(12,2) DEFAULT 0
  discount_amount DECIMAL(12,2) DEFAULT 0    -- từ voucher
  platform_fee    DECIMAL(12,2) DEFAULT 0    -- phí platform
  total_amount    DECIMAL(12,2) NOT NULL      -- khách trả
  payment_method  ENUM('momo', 'bank', 'cash')
  payment_status  ENUM('pending', 'paid', 'refunded')
  voucher_id      UUID REFERENCES Vouchers(id)
  delivery_address TEXT
  delivery_lat    DECIMAL(10,8)
  delivery_lng    DECIMAL(11,8)
  distance_km     DECIMAL(6,2)
  cancel_reason   TEXT
  note            TEXT
  estimated_delivery_at TIMESTAMP
  delivered_at    TIMESTAMP
  completed_at    TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()

-- Chi tiết đơn hàng
OrderItems
  id              UUID PRIMARY KEY
  order_id        UUID REFERENCES Orders(id)
  item_id         UUID REFERENCES MenuItems(id)
  item_name       VARCHAR(150)  -- snapshot tên món
  quantity        INT NOT NULL
  unit_price      DECIMAL(12,2) NOT NULL
  total_price     DECIMAL(12,2) NOT NULL

-- Shipper profile
Shippers
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES Users(id) UNIQUE
  vehicle_type    ENUM('bicycle', 'motorbike', 'car')
  vehicle_plate   VARCHAR(20)
  lat             DECIMAL(10,8)
  lng             DECIMAL(11,8)
  is_active       BOOLEAN DEFAULT false   -- đang sẵn sàng nhận đơn
  cancel_rate     DECIMAL(5,4) DEFAULT 0  -- tỉ lệ hủy đơn
  avg_rating      DECIMAL(3,2) DEFAULT 5
  total_deliveries INT DEFAULT 0
  wallet_cash     DECIMAL(12,2) DEFAULT 0   -- Cash Wallet
  wallet_account  DECIMAL(12,2) DEFAULT 0   -- Account Wallet
  ekyc_status     ENUM('pending', 'verified', 'rejected')
  penalty_level   INT DEFAULT 0
  bank_account    JSONB

-- Thanh toán
Payments
  id              UUID PRIMARY KEY
  order_id        UUID REFERENCES Orders(id)
  method          ENUM('momo', 'bank', 'cash')
  status          ENUM('pending', 'paid', 'failed', 'refunded')
  amount          DECIMAL(12,2)
  transaction_id  VARCHAR(100)  -- ID từ payment gateway
  gateway_response JSONB
  created_at      TIMESTAMP DEFAULT NOW()

-- Chia hoa hồng
Commissions
  id              UUID PRIMARY KEY
  order_id        UUID REFERENCES Orders(id) UNIQUE
  food_amount     DECIMAL(12,2)
  ship_amount     DECIMAL(12,2)
  restaurant_share DECIMAL(12,2)
  shipper_share   DECIMAL(12,2)
  platform_share  DECIMAL(12,2)
  processed_at    TIMESTAMP

-- Voucher
Vouchers
  id              UUID PRIMARY KEY
  code            VARCHAR(20) UNIQUE NOT NULL
  type            ENUM('platform', 'restaurant', 'ship')
  discount_type   ENUM('percent', 'fixed', 'free_ship', 'buy_x_get_y')
  discount_value  DECIMAL(10,2)
  max_discount    DECIMAL(10,2)
  min_order_value DECIMAL(10,2)
  valid_from      TIMESTAMP
  valid_to        TIMESTAMP
  total_limit     INT
  used_count      INT DEFAULT 0
  per_user_limit  INT DEFAULT 1
  applicable_restaurant_ids UUID[]
  applicable_category_ids   UUID[]
  applicable_hours  JSONB
  applicable_order_type ENUM('delivery', 'pickup', 'both')
  issued_by       UUID REFERENCES Users(id)
  created_at      TIMESTAMP DEFAULT NOW()

VoucherUsages
  id              UUID PRIMARY KEY
  voucher_id      UUID REFERENCES Vouchers(id)
  user_id         UUID REFERENCES Users(id)
  order_id        UUID REFERENCES Orders(id)
  discount_applied DECIMAL(12,2)
  used_at         TIMESTAMP

-- Cấu hình hệ thống
AppConfig
  key             VARCHAR(100) PRIMARY KEY
  value           TEXT
  description     TEXT
  updated_at      TIMESTAMP
  -- Ví dụ keys:
  -- platform_food_fee_rate = "0.20"
  -- platform_ship_fee_rate = "0.15"
  -- system_radius_km = "10"
  -- peak_radius_km = "7"
  -- peak_hours = "[{from:'11:00',to:'13:00'},{from:'17:00',to:'19:00'}]"

-- Payout Shipper
ShipperPayouts
  id              UUID PRIMARY KEY
  shipper_id      UUID REFERENCES Shippers(id)
  amount          DECIMAL(12,2)
  period_start    DATE
  period_end      DATE
  status          ENUM('pending', 'processing', 'completed', 'failed')
  bank_transaction_id VARCHAR(100)
  processed_at    TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()

-- Payout Restaurant
RestaurantPayouts
  id              UUID PRIMARY KEY
  restaurant_id   UUID REFERENCES Restaurants(id)
  amount          DECIMAL(12,2)
  period_start    DATE
  period_end      DATE
  status          ENUM('pending', 'processing', 'completed', 'failed')
  processed_at    TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()

-- Phạt Shipper
ShipperPenalties
  id              UUID PRIMARY KEY
  shipper_id      UUID REFERENCES Shippers(id)
  reason          ENUM('high_cancel_rate', 'low_rating', 'late_delivery', 'misconduct')
  level           INT  -- 1, 2, 3, 4
  description     TEXT
  expires_at      TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()

-- Thông báo
Notifications
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES Users(id)
  title           VARCHAR(200)
  body            TEXT
  type            VARCHAR(50)  -- 'order_update', 'payout', 'voucher', ...
  data            JSONB        -- extra data (order_id, etc.)
  is_read         BOOLEAN DEFAULT false
  created_at      TIMESTAMP DEFAULT NOW()

-- Đánh giá
Reviews
  id              UUID PRIMARY KEY
  order_id        UUID REFERENCES Orders(id) UNIQUE
  customer_id     UUID REFERENCES Users(id)
  restaurant_id   UUID REFERENCES Restaurants(id)
  shipper_id      UUID REFERENCES Shippers(id)
  restaurant_rating INT CHECK(rating BETWEEN 1 AND 5)
  shipper_rating    INT CHECK(rating BETWEEN 1 AND 5)
  comment         TEXT
  created_at      TIMESTAMP DEFAULT NOW()

-- Chat Messages
ChatMessages
  id              UUID PRIMARY KEY
  order_id        UUID REFERENCES Orders(id)
  sender_id       UUID REFERENCES Users(id)
  receiver_id     UUID REFERENCES Users(id)
  content         TEXT
  type            ENUM('text', 'image', 'template')
  is_read         BOOLEAN DEFAULT false
  created_at      TIMESTAMP DEFAULT NOW()
```

---

## Redis (Cache & Realtime)

```
shipper:location:{shipper_id}   → {lat, lng, updated_at}  TTL: 10s
order:status:{order_id}          → current status           TTL: 1h
session:{user_id}                → JWT token                TTL: 7d
otp:{phone}                      → OTP code                 TTL: 5m
rate_limit:{phone}               → attempt count            TTL: 15m
```

---

## 🔗 Xem Thêm
- [Tech stack](./11-tech-stack.md)
- [Business logic](./03-business-logic.md)

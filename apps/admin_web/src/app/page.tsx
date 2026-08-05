import React from 'react';
import { adminDesignTokens } from '../theme/tokens';

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: adminDesignTokens.padding.lg, fontFamily: 'system-ui, sans-serif', backgroundColor: adminDesignTokens.colors.background, minHeight: '100vh' }}>
      <header style={{ marginBottom: adminDesignTokens.padding.lg }}>
        <h1 style={{ fontSize: adminDesignTokens.fontSize.h1, color: adminDesignTokens.colors.primary, margin: '0 0 8px 0' }}>🍜 Tran Gia Food — Dashboard Quản Trị</h1>
        <p style={{ color: adminDesignTokens.colors.textSecondary, margin: 0 }}>Tổng quan tình hình kinh doanh & hoạt động hệ thống toàn quốc</p>
      </header>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng Doanh Thu Platform</span>
          <span style={valueStyle}>125.450.000 đ</span>
          <span style={{ color: adminDesignTokens.colors.statusApproved, fontSize: adminDesignTokens.fontSize.sm, fontWeight: adminDesignTokens.fontWeight.bold }}>▲ +18.5% so với tháng trước</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng GMV Đặt Hàng</span>
          <span style={valueStyle}>627.250.000 đ</span>
          <span style={{ color: adminDesignTokens.colors.statusApproved, fontSize: adminDesignTokens.fontSize.sm, fontWeight: adminDesignTokens.fontWeight.bold }}>▲ +24.2% GMV đồ ăn</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng Số Đơn Hàng</span>
          <span style={valueStyle}>4.820 đơn</span>
          <span style={{ color: adminDesignTokens.colors.primary, fontSize: adminDesignTokens.fontSize.sm, fontWeight: adminDesignTokens.fontWeight.bold }}>● 98.2% giao thành công</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Shipper Đang Hoạt Động</span>
          <span style={valueStyle}>154 tài xế</span>
          <span style={{ color: adminDesignTokens.colors.statusPending, fontSize: adminDesignTokens.fontSize.sm, fontWeight: adminDesignTokens.fontWeight.bold }}>⏳ 12 hồ sơ chờ duyệt eKYC</span>
        </div>
      </div>

      {/* Shipper eKYC Pending Table */}
      <div style={{ backgroundColor: adminDesignTokens.colors.surface, borderRadius: adminDesignTokens.borderRadius.lg, padding: adminDesignTokens.padding.md, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: adminDesignTokens.fontSize.lg, marginTop: 0, marginBottom: '20px' }}>📋 Danh Sách Shipper Chờ Duyệt eKYC</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${adminDesignTokens.colors.border}`, color: adminDesignTokens.colors.textMuted }}>
              <th style={thStyle}>Họ & Tên</th>
              <th style={thStyle}>Số Điện Thoại</th>
              <th style={thStyle}>Loại Xe</th>
              <th style={thStyle}>Biển Số Xe</th>
              <th style={thStyle}>Trạng Thái eKYC</th>
              <th style={thStyle}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${adminDesignTokens.colors.border}` }}>
              <td style={tdStyle}>Nguyễn Văn Cường</td>
              <td style={tdStyle}>0912 345 678</td>
              <td style={tdStyle}>Xe Máy (Honda Wave)</td>
              <td style={tdStyle}>59P1-999.88</td>
              <td style={tdStyle}><span style={badgePending}>PENDING</span></td>
              <td style={tdStyle}>
                <button style={btnApprove}>Duyệt eKYC</button>
                <button style={btnReject}>Từ Chối</button>
              </td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${adminDesignTokens.colors.border}` }}>
              <td style={tdStyle}>Lê Hoàng Nam</td>
              <td style={tdStyle}>0987 654 321</td>
              <td style={tdStyle}>Xe Máy (Yamaha Exciter)</td>
              <td style={tdStyle}>59X2-123.45</td>
              <td style={tdStyle}><span style={badgePending}>PENDING</span></td>
              <td style={tdStyle}>
                <button style={btnApprove}>Duyệt eKYC</button>
                <button style={btnReject}>Từ Chối</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: adminDesignTokens.colors.surface,
  borderRadius: adminDesignTokens.borderRadius.lg,
  padding: adminDesignTokens.padding.md,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = { fontSize: adminDesignTokens.fontSize.body, color: adminDesignTokens.colors.textSecondary, fontWeight: adminDesignTokens.fontWeight.semiBold };
const valueStyle: React.CSSProperties = { fontSize: adminDesignTokens.fontSize.xl, fontWeight: adminDesignTokens.fontWeight.extraBold, color: adminDesignTokens.colors.textPrimary };
const thStyle: React.CSSProperties = { padding: '14px 12px', fontSize: adminDesignTokens.fontSize.body };
const tdStyle: React.CSSProperties = { padding: '14px 12px', fontSize: adminDesignTokens.fontSize.body };
const badgePending: React.CSSProperties = { backgroundColor: adminDesignTokens.colors.statusPendingBg, color: adminDesignTokens.colors.statusPending, padding: '4px 8px', borderRadius: adminDesignTokens.borderRadius.sm, fontSize: adminDesignTokens.fontSize.xs, fontWeight: adminDesignTokens.fontWeight.bold };
const btnApprove: React.CSSProperties = { backgroundColor: adminDesignTokens.colors.statusApproved, color: adminDesignTokens.colors.surface, border: 'none', padding: '6px 12px', borderRadius: adminDesignTokens.borderRadius.md, cursor: 'pointer', marginRight: '8px', fontWeight: adminDesignTokens.fontWeight.bold };
const btnReject: React.CSSProperties = { backgroundColor: adminDesignTokens.colors.statusRejected, color: adminDesignTokens.colors.surface, border: 'none', padding: '6px 12px', borderRadius: adminDesignTokens.borderRadius.md, cursor: 'pointer', fontWeight: adminDesignTokens.fontWeight.bold };

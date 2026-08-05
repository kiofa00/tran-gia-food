import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#FF6635', margin: '0 0 8px 0' }}>🍜 Tran Gia Food — Dashboard Quản Trị</h1>
        <p style={{ color: '#6c757d', margin: 0 }}>Tổng quan tình hình kinh doanh & hoạt động hệ thống toàn quốc</p>
      </header>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng Doanh Thu Platform</span>
          <span style={valueStyle}>125.450.000 đ</span>
          <span style={{ color: '#28a745', fontSize: '13px', fontWeight: 'bold' }}>▲ +18.5% so với tháng trước</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng GMV Đặt Hàng</span>
          <span style={valueStyle}>627.250.000 đ</span>
          <span style={{ color: '#28a745', fontSize: '13px', fontWeight: 'bold' }}>▲ +24.2% GMV đồ ăn</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Tổng Số Đơn Hàng</span>
          <span style={valueStyle}>4.820 đơn</span>
          <span style={{ color: '#0d6efd', fontSize: '13px', fontWeight: 'bold' }}>● 98.2% giao thành công</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Shipper Đang Hoạt Động</span>
          <span style={valueStyle}>154 tài xế</span>
          <span style={{ color: '#ffc107', fontSize: '13px', fontWeight: 'bold' }}>⏳ 12 hồ sơ chờ duyệt eKYC</span>
        </div>
      </div>

      {/* Shipper eKYC Pending Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '20px' }}>📋 Danh Sách Shipper Chờ Duyệt eKYC</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6', color: '#495057' }}>
              <th style={thStyle}>Họ & Tên</th>
              <th style={thStyle}>Số Điện Thoại</th>
              <th style={thStyle}>Loại Xe</th>
              <th style={thStyle}>Biển Số Xe</th>
              <th style={thStyle}>Trạng Thái eKYC</th>
              <th style={thStyle}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e9ecef' }}>
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
            <tr style={{ borderBottom: '1px solid #e9ecef' }}>
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
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = { fontSize: '14px', color: '#6c757d', fontWeight: '600' };
const valueStyle: React.CSSProperties = { fontSize: '26px', fontWeight: '800', color: '#212529' };
const thStyle: React.CSSProperties = { padding: '14px 12px', fontSize: '14px' };
const tdStyle: React.CSSProperties = { padding: '14px 12px', fontSize: '14px' };
const badgePending: React.CSSProperties = { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
const btnApprove: React.CSSProperties = { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' };
const btnReject: React.CSSProperties = { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: 500,
            width: '90%',
            backgroundColor: '#FFFFFF',
            padding: 40,
            borderRadius: 16,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: '#FF6B00', fontSize: 24, fontWeight: 700, margin: '0 0 12px 0' }}>
            500 — Sự Cố Hệ Thống Nghiêm Trọng
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            Đã có lỗi nghiêm trọng tại Root Layout của ứng dụng Admin Web.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#FF6B00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)',
            }}
          >
            Thử Khởi Động Lại
          </button>
        </div>
      </body>
    </html>
  );
}

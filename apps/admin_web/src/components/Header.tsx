'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Avatar, Dropdown, Badge, Space, Typography, Button, Drawer, Menu, Divider } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SettingOutlined,
  MenuOutlined,
  DashboardOutlined,
  CarOutlined,
  TagOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

interface HeaderProps {
  title: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, userName }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt hệ thống',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const navLinks = [
    { key: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
    { key: '/fleet', label: 'Đội Xe', icon: <CarOutlined /> },
    { key: '/vouchers', label: 'Mã Giảm Giá', icon: <TagOutlined /> },
    { key: '/commissions', label: 'Hoa Hồng & Ví', icon: <DollarOutlined /> },
    { key: '/analytics', label: 'Báo Cáo Financials', icon: <BarChartOutlined /> },
    { key: '/cms', label: 'Quản Lý CMS', icon: <FileTextOutlined /> },
  ];

  return (
    <>
      <AntHeader
        data-testid="admin-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          backgroundColor: adminDesignTokens.colors.primary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Brand Logo & Desktop Navigation */}
        <Space size="large" align="center">
          <Link href="/" prefetch={true} style={{ textDecoration: 'none' }} className="header-brand-logo">
            <Title
              data-testid="header-title"
              level={4}
              style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: '-0.5px', transition: 'all 0.2s ease' }}
            >
              🍜 Tran Gia Food
            </Title>
          </Link>

          {/* Desktop Nav Links (Hidden on small mobile) */}
          <div className="desktop-nav" style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.key;
              return (
                <Link key={link.key} href={link.key} prefetch={true} style={{ textDecoration: 'none' }}>
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    icon={link.icon}
                    className={`header-nav-btn ${isActive ? 'active' : ''}`}
                    style={{
                      color: '#ffffff',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 8,
                      border: 'none',
                    }}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </Space>

        {/* Desktop Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notifications & Language */}
          <Space size="small" align="center" className="desktop-nav">
            <Button
              type="text"
              className="header-icon-btn"
              icon={<GlobalOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
              title="Ngôn ngữ"
            />
            <Button
              type="text"
              className="header-icon-btn"
              icon={<BellOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
              title="Thông báo"
            />
          </Space>

          {/* User profile dropdown (Desktop) */}
          {userName && (
            <div className="desktop-nav">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space className="header-user-badge" style={{ cursor: 'pointer' }}>
                  <Avatar
                    style={{ backgroundColor: '#ffffff', color: adminDesignTokens.colors.primary }}
                    icon={<UserOutlined />}
                  />
                  <Text data-testid="user-greeting" style={{ color: '#ffffff', fontWeight: 600 }}>
                    {userName}
                  </Text>
                </Space>
              </Dropdown>
            </div>
          )}

          {/* Hamburger Menu Button (Mobile Trigger) */}
          <Button
            className="mobile-menu-btn header-icon-btn"
            type="text"
            icon={<MenuOutlined style={{ color: '#ffffff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở menu quản trị"
            style={{ display: 'none' }}
          />
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar style={{ backgroundColor: adminDesignTokens.colors.primary }} icon={<UserOutlined />} />
            <div>
              <Text strong style={{ display: 'block' }}>{userName || 'Admin'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Quản trị viên hệ thống</Text>
            </div>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
          items={navLinks.map((link) => ({
            key: link.key,
            icon: link.icon,
            label: <Link href={link.key} onClick={() => setDrawerOpen(false)}>{link.label}</Link>,
          }))}
        />

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ padding: '0 12px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button icon={<BellOutlined />} block style={{ textAlign: 'left' }}>
              Thông Báo Đơn Hàng
            </Button>
            <Button icon={<SettingOutlined />} block style={{ textAlign: 'left' }}>
              Cài Đặt Hệ Thống
            </Button>
            <Button danger icon={<LogoutOutlined />} block style={{ textAlign: 'left' }}>
              Đăng Xuất
            </Button>
          </Space>
        </div>
      </Drawer>

      {/* Responsive & Custom Hover CSS Styles */}
      <style jsx global>{`
        .header-brand-logo:hover h4 {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .header-nav-btn {
          color: #ffffff !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .header-nav-btn:hover {
          background-color: rgba(255, 255, 255, 0.22) !important;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
        }

        .header-nav-btn.active:hover {
          background-color: rgba(255, 255, 255, 0.32) !important;
        }

        .header-icon-btn {
          color: #ffffff !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .header-icon-btn:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
          transform: scale(1.12);
        }

        .header-user-badge {
          padding: 2px 10px;
          border-radius: 20px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-user-badge:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .mobile-menu-btn {
          display: none !important;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
};

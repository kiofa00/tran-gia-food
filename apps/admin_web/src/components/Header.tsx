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
    { key: '/fleet', label: 'Giám Sát Đội Xe', icon: <CarOutlined /> },
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
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title
              data-testid="header-title"
              level={4}
              style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}
            >
              🍜 Tran Gia Food
            </Title>
          </Link>

          {/* Desktop Nav Links (Hidden on small mobile) */}
          <div className="desktop-nav" style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.key;
              return (
                <Link key={link.key} href={link.key} style={{ textDecoration: 'none' }}>
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    icon={link.icon}
                    style={{
                      color: '#ffffff',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 6,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Notifications & Language */}
          <Space size="middle" align="center" className="desktop-nav">
            <Button
              type="text"
              icon={<GlobalOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
            />
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
              />
            </Badge>
          </Space>

          {/* User profile dropdown (Desktop) */}
          {userName && (
            <div className="desktop-nav">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: 'pointer' }}>
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
            className="mobile-menu-btn"
            type="text"
            icon={<MenuOutlined style={{ color: '#ffffff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở menu quản trị"
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
            <Badge count={5} size="small" style={{ marginRight: 8 }}>
              <Button icon={<BellOutlined />} block style={{ textAlign: 'left' }}>
                Thông Báo Đơn Hàng (5)
              </Button>
            </Badge>
            <Button icon={<SettingOutlined />} block style={{ textAlign: 'left' }}>
              Cài Đặt Hệ Thống
            </Button>
            <Button danger icon={<LogoutOutlined />} block style={{ textAlign: 'left' }}>
              Đăng Xuất
            </Button>
          </Space>
        </div>
      </Drawer>

      {/* Responsive CSS Media Queries */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

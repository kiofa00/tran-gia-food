'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Avatar, Dropdown, Space, Typography, Button, Drawer, Menu, Divider } from 'antd';
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
        className="flex items-center justify-between px-5 bg-orange-500 shadow-md h-16 sticky top-0 z-50 border-b border-orange-600"
      >
        {/* Brand Logo & Desktop Navigation */}
        <Space size="large" align="center">
          <Link href="/" prefetch={true} className="no-underline header-brand-logo">
            <Title
              data-testid="header-title"
              level={4}
              className="text-white m-0 font-extrabold tracking-tight transition-all duration-200"
            >
              🍜 Tran Gia Food
            </Title>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav flex gap-2 ml-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.key;
              return (
                <Link key={link.key} href={link.key} prefetch={true} className="no-underline">
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    icon={link.icon}
                    className={`header-nav-btn ${isActive ? 'active bg-white/25 font-bold' : 'bg-transparent font-medium'} text-white rounded-lg border-none`}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </Space>

        {/* Desktop Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications & Language */}
          <Space size="small" align="center" className="desktop-nav">
            <Button
              type="text"
              className="header-icon-btn text-white text-lg"
              icon={<GlobalOutlined className="text-white text-lg" />}
              title="Ngôn ngữ"
            />
            <Button
              type="text"
              className="header-icon-btn text-white text-lg"
              icon={<BellOutlined className="text-white text-lg" />}
              title="Thông báo"
            />
          </Space>

          {/* User profile dropdown (Desktop) */}
          {userName && (
            <div className="desktop-nav">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space className="header-user-badge cursor-pointer">
                  <Avatar
                    className="bg-white text-orange-500 font-bold"
                    icon={<UserOutlined />}
                  />
                  <Text data-testid="user-greeting" className="text-white font-semibold">
                    {userName}
                  </Text>
                </Space>
              </Dropdown>
            </div>
          )}

          {/* Hamburger Menu Button (Mobile Trigger) */}
          <Button
            className="mobile-menu-btn header-icon-btn hidden text-white text-xl"
            type="text"
            icon={<MenuOutlined className="text-white text-xl" />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở menu quản trị"
          />
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar className="bg-orange-500 text-white" icon={<UserOutlined />} />
            <div>
              <Text strong className="block">{userName || 'Admin'}</Text>
              <Text type="secondary" className="text-xs">Quản trị viên hệ thống</Text>
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
          className="border-r-0"
          items={navLinks.map((link) => ({
            key: link.key,
            icon: link.icon,
            label: <Link href={link.key} onClick={() => setDrawerOpen(false)}>{link.label}</Link>,
          }))}
        />

        <Divider className="my-4" />

        <div className="px-3">
          <Space direction="vertical" className="w-full" size="middle">
            <Button icon={<BellOutlined />} block className="text-left">
              Thông Báo Đơn Hàng
            </Button>
            <Button icon={<SettingOutlined />} block className="text-left">
              Cài Đặt Hệ Thống
            </Button>
            <Button danger icon={<LogoutOutlined />} block className="text-left">
              Đăng Xuất
            </Button>
          </Space>
        </div>
      </Drawer>
    </>
  );
};

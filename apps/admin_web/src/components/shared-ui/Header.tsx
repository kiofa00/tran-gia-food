'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';

import { useAuth } from '@/hooks/useAuth';
import { ADMIN_NAV_LINKS, ADMIN_ROUTES } from '@/shared-config';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

/** Tailwind class để hover icon button trên nền orange giống màu active */
const ICON_BTN_CLS = 'text-white hover:!bg-white/20 rounded-lg transition-colors duration-150';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const { logout } = useAuth();

  const userMenuItems = [
    { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
    { key: 'settings', label: 'Cài đặt hệ thống', icon: <SettingOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: logout },
  ];

  const iconMap = {
    DashboardOutlined: <DashboardOutlined />,
    CarOutlined: <CarOutlined />,
    TagOutlined: <TagOutlined />,
    DollarOutlined: <DollarOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    FileTextOutlined: <FileTextOutlined />,
  };

  const navLinks = ADMIN_NAV_LINKS.map((link) => ({
    key: link.key,
    label: link.label,
    icon: iconMap[link.iconName],
  }));

  return (
    <>
      <AntHeader
        data-testid="admin-header"
        className="!bg-orange-500 !px-0 shadow-md h-16 sticky top-0 z-50 border-b border-orange-600"
      >
        <div className="page-container h-full flex items-center justify-between">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-center">
            <Link href={ADMIN_ROUTES.HOME} prefetch={true} className="no-underline">
              <Title
                data-testid="header-title"
                level={4}
                className="!m-0 text-white font-extrabold tracking-tight"
              >
                🍜 Tran Gia Food
              </Title>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex gap-1 ml-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.key;

                return (
                  <Link key={link.key} href={link.key} prefetch={true} className="no-underline">
                    <Button
                      type="text"
                      icon={link.icon}
                      className={`text-white border-none rounded-lg transition-colors duration-150 ${
                        isActive ? '!bg-white/25 font-semibold' : 'hover:!bg-white/15 font-medium'
                      }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
            {/* Icon buttons — desktop only */}
            <div className="hidden lg:flex items-center gap-1">
              <Button
                type="text"
                icon={<GlobalOutlined />}
                title="Ngôn ngữ"
                className={ICON_BTN_CLS}
              />
              <Button
                type="text"
                icon={<BellOutlined />}
                title="Thông báo"
                className={ICON_BTN_CLS}
              />
            </div>

            {/* User dropdown — desktop only */}
            {userName && (
              <div className="hidden lg:block ml-1">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Space className={`cursor-pointer px-2 py-1 rounded-lg ${ICON_BTN_CLS}`}>
                    <Avatar
                      className="!bg-white !text-orange-500 font-bold"
                      size="small"
                      icon={<UserOutlined />}
                    />
                    <Text data-testid="user-greeting" className="text-white font-semibold text-sm">
                      {userName}
                    </Text>
                  </Space>
                </Dropdown>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <div className="lg:hidden">
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Mở menu"
                className={ICON_BTN_CLS}
              />
            </div>
          </div>
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar className="!bg-orange-500 !text-white" icon={<UserOutlined />} />
            <div>
              <Text strong className="block">
                {userName || 'Admin'}
              </Text>
              <Text type="secondary" className="text-xs">
                Quản trị viên hệ thống
              </Text>
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
          className="!border-none"
          items={navLinks.map((link) => ({
            key: link.key,
            icon: link.icon,
            label: (
              <Link href={link.key} onClick={() => setDrawerOpen(false)}>
                {link.label}
              </Link>
            ),
          }))}
        />

        <Divider className="my-4" />

        <div className="px-3">
          <Space direction="vertical" className="w-full" size="small">
            <Button icon={<BellOutlined />} block className="text-left">
              Thông Báo
            </Button>
            <Button icon={<SettingOutlined />} block className="text-left">
              Cài Đặt
            </Button>
            <Button danger icon={<LogoutOutlined />} block className="text-left" onClick={logout}>
              Đăng Xuất
            </Button>
          </Space>
        </div>
      </Drawer>
    </>
  );
};

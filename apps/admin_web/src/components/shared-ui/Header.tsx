'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  CheckOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  SunOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';

import { useAuth } from '@/hooks/useAuth';
import { TranslationKey, useTranslation } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { ADMIN_NAV_LINKS, ADMIN_ROUTES } from '@/shared-config';
import { cn } from '@/utils/cn';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

/** Tailwind class để hover icon button trên nền orange giống màu active */
const ICON_BTN_CLS = '!text-white hover:!bg-white/20 rounded-lg transition-colors duration-150';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useTranslation();

  const userMenuItems = useMemo(
    () => [
      { key: 'profile', label: t('header.profile', 'Hồ sơ cá nhân'), icon: <UserOutlined /> },
      {
        key: 'settings',
        label: t('header.settings', 'Cài đặt hệ thống'),
        icon: <SettingOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: t('header.logout', 'Đăng xuất'),
        icon: <LogoutOutlined />,
        danger: true,
        onClick: logout,
      },
    ],
    [t, logout],
  );

  const iconMap = useMemo(
    () => ({
      DashboardOutlined: <DashboardOutlined />,
      CarOutlined: <CarOutlined />,
      TeamOutlined: <TeamOutlined />,
      TagOutlined: <TagOutlined />,
      DollarOutlined: <DollarOutlined />,
      BarChartOutlined: <BarChartOutlined />,
      FileTextOutlined: <FileTextOutlined />,
      ShopOutlined: <ShopOutlined />,
      WalletOutlined: <WalletOutlined />,
      SafetyCertificateOutlined: <SafetyCertificateOutlined />,
    }),
    [],
  );

  const languageMenuItems = useMemo(
    () =>
      availableLanguages.map((lang) => ({
        key: lang.code,
        label: (
          <Space className="w-full justify-between">
            <span>
              {lang.flag} {lang.label}
            </span>
            {language === lang.code && <CheckOutlined className="text-orange-500 text-xs ml-2" />}
          </Space>
        ),
        onClick: () => setLanguage(lang.code),
      })),
    [availableLanguages, language, setLanguage],
  );

  const navLinks = useMemo(
    () =>
      ADMIN_NAV_LINKS.map((link) => {
        const navKey =
          `nav.${link.key === '/' ? 'dashboard' : link.key.replace('/', '')}` as TranslationKey;

        return {
          key: link.key,
          label: t(navKey, link.label),
          icon: iconMap[link.iconName],
        };
      }),
    [t, iconMap],
  );

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
                className="!m-0 !text-white font-extrabold tracking-tight"
              >
                🍜 Tran Gia Food
              </Title>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex gap-2 ml-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.key;

                return (
                  <Link key={link.key} href={link.key} prefetch={true} className="no-underline">
                    <Button
                      type="text"
                      icon={link.icon}
                      className={cn(
                        '!text-white border-none rounded-lg transition-colors duration-150',
                        isActive ? '!bg-white/25 font-semibold' : 'hover:!bg-white/15 font-medium',
                      )}
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
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                title={t(
                  isDark ? 'header.theme.light' : 'header.theme.dark',
                  isDark ? 'Giao diện Sáng' : 'Giao diện Tối',
                )}
                className={ICON_BTN_CLS}
              />
              <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight" arrow>
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  title={t('header.language', 'Ngôn ngữ')}
                  className={ICON_BTN_CLS}
                />
              </Dropdown>
              <Button
                type="text"
                icon={<BellOutlined />}
                title={t('header.notifications', 'Thông báo')}
                className={ICON_BTN_CLS}
              />
            </div>

            {/* User dropdown — desktop only */}
            {userName && (
              <div className="hidden lg:block ml-1">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Space className={cn('cursor-pointer px-2 py-1 rounded-lg', ICON_BTN_CLS)}>
                    <Avatar
                      className="!bg-white !text-orange-500 font-bold"
                      size="small"
                      icon={<UserOutlined />}
                    />
                    <Text data-testid="user-greeting" className="!text-white font-semibold text-sm">
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
                {t('header.adminRole', 'Quản trị viên hệ thống')}
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
              {t('header.notifications', 'Thông báo')}
            </Button>
            <Button icon={<SettingOutlined />} block className="text-left">
              {t('header.settings', 'Cài đặt hệ thống')}
            </Button>
            <Button danger icon={<LogoutOutlined />} block className="text-left" onClick={logout}>
              {t('header.logout', 'Đăng xuất')}
            </Button>
          </Space>
        </div>
      </Drawer>
    </>
  );
};

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
  DownOutlined,
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
import { ADMIN_NAV_GROUPS, ADMIN_ROUTES, IconName } from '@/shared-config';
import { cn } from '@/utils/cn';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

/** Tailwind class để hover icon button trên nền orange */
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

  const iconMap = useMemo<Record<IconName, React.ReactNode>>(
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

  // Grouped Navigation with i18n
  const navGroups = useMemo(
    () =>
      ADMIN_NAV_GROUPS.map((group) => {
        const groupKey = `nav.${group.key}` as TranslationKey;
        const icon = group.iconName ? iconMap[group.iconName] : undefined;

        if (group.children) {
          const children = group.children.map((child) => {
            const childNavKey =
              `nav.${child.key === '/' ? 'dashboard' : child.key.replace('/', '')}` as TranslationKey;

            return {
              key: child.key,
              label: t(childNavKey, child.label),
              icon: iconMap[child.iconName],
            };
          });

          return {
            key: group.key,
            label: t(groupKey, group.label),
            icon,
            children,
          };
        }

        return {
          key: group.key,
          label: t(groupKey, group.label),
          icon,
          href: group.href || '/',
        };
      }),
    [t, iconMap],
  );

  return (
    <>
      <AntHeader
        data-testid="admin-header"
        className="!bg-orange-500 !px-4 lg:!px-8 shadow-md h-16 sticky top-0 z-50 border-b border-orange-600"
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Left: Brand Logo + Desktop Nav */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href={ADMIN_ROUTES.HOME}
              prefetch={true}
              className="no-underline flex items-center shrink-0"
            >
              <Title
                data-testid="header-title"
                level={4}
                className="!m-0 !text-white font-black tracking-tight whitespace-nowrap select-none hover:opacity-90 transition-opacity"
              >
                🍜 Tran Gia Food
              </Title>
            </Link>

            {/* Desktop Grouped Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navGroups.map((group) => {
                if (group.children) {
                  const isChildActive = group.children.some((c) => pathname === c.key);

                  const dropdownItems = group.children.map((child) => ({
                    key: child.key,
                    icon: child.icon,
                    label: (
                      <Link
                        href={child.key}
                        prefetch={true}
                        className={cn(
                          'block px-1 py-0.5 no-underline transition-colors',
                          pathname === child.key
                            ? 'text-orange-600 font-bold'
                            : 'text-gray-700 hover:text-orange-500 font-medium',
                        )}
                      >
                        {child.label}
                      </Link>
                    ),
                    className:
                      pathname === child.key ? '!bg-orange-50/80 rounded-md' : 'rounded-md',
                  }));

                  return (
                    <Dropdown
                      key={group.key}
                      menu={{ items: dropdownItems }}
                      placement="bottomLeft"
                      arrow
                    >
                      <Button
                        type="text"
                        className={cn(
                          '!text-white border-none rounded-lg transition-all duration-150 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 h-auto',
                          isChildActive ? '!bg-white/25 font-bold shadow-xs' : 'hover:!bg-white/15',
                        )}
                      >
                        {group.icon}
                        <span>{group.label}</span>
                        <DownOutlined
                          className={cn(
                            'text-[10px] ml-0.5 transition-transform duration-200',
                            isChildActive ? 'opacity-100 font-bold' : 'opacity-70',
                          )}
                        />
                      </Button>
                    </Dropdown>
                  );
                }

                // Direct top-level button
                const isActive = pathname === group.href;

                return (
                  <Link key={group.key} href={group.href!} prefetch={true} className="no-underline">
                    <Button
                      type="text"
                      icon={group.icon}
                      className={cn(
                        '!text-white border-none rounded-lg transition-all duration-150 text-sm font-medium px-3 py-1.5 h-auto flex items-center gap-1.5',
                        isActive ? '!bg-white/25 font-bold shadow-xs' : 'hover:!bg-white/15',
                      )}
                    >
                      {group.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Controls & User Profile */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Desktop Actions */}
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

            {/* User Dropdown */}
            {userName && (
              <div className="hidden lg:block ml-2">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Space
                    className={cn(
                      'cursor-pointer px-2.5 py-1 rounded-lg select-none',
                      ICON_BTN_CLS,
                    )}
                  >
                    <Avatar
                      className="!bg-white !text-orange-500 font-bold shadow-xs"
                      size="small"
                      icon={<UserOutlined />}
                    />
                    <Text
                      data-testid="user-greeting"
                      className="!text-white font-semibold text-sm whitespace-nowrap"
                    >
                      {userName}
                    </Text>
                  </Space>
                </Dropdown>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
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

      {/* Mobile Drawer Navigation */}
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
        width={300}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['operations', 'finance']}
          className="!border-none"
          items={navGroups.map((group) => {
            if (group.children) {
              return {
                key: group.key,
                icon: group.icon,
                label: <span className="font-semibold text-gray-900">{group.label}</span>,
                children: group.children.map((child) => ({
                  key: child.key,
                  icon: child.icon,
                  label: (
                    <Link href={child.key} onClick={() => setDrawerOpen(false)}>
                      {child.label}
                    </Link>
                  ),
                })),
              };
            }

            return {
              key: group.href!,
              icon: group.icon,
              label: (
                <Link href={group.href!} onClick={() => setDrawerOpen(false)}>
                  {group.label}
                </Link>
              ),
            };
          })}
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

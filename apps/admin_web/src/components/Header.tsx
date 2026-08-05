'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Badge, Space, Typography, Button } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { adminDesignTokens } from '../theme/tokens';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

interface HeaderProps {
  title: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, userName }) => {
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

  return (
    <AntHeader
      data-testid="admin-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: adminDesignTokens.colors.primary,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        height: '64px',
      }}
    >
      {/* Brand Logo & Title */}
      <Space size="middle" align="center">
        <Title
          data-testid="header-title"
          level={4}
          style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}
        >
          {title}
        </Title>
      </Space>

      {/* Right Controls */}
      <Space size="large" align="center">
        {/* Language selector icon */}
        <Button
          type="text"
          icon={<GlobalOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
        />

        {/* Notifications badge */}
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
          />
        </Badge>

        {/* User profile dropdown */}
        {userName && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: '#ffffff', color: adminDesignTokens.colors.primary }}
                icon={<UserOutlined />}
              />
              <Text data-testid="user-greeting" style={{ color: '#ffffff', fontWeight: 600 }}>
                Xin chào, {userName}
              </Text>
            </Space>
          </Dropdown>
        )}
      </Space>
    </AntHeader>
  );
};

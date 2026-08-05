import React from 'react';

interface HeaderProps {
  title: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, userName }) => {
  return (
    <header data-testid="admin-header" style={{ padding: '16px 24px', background: '#FF6635', color: '#fff' }}>
      <h1 data-testid="header-title">{title}</h1>
      {userName && <span data-testid="user-greeting">Xin chào, {userName}</span>}
    </header>
  );
};

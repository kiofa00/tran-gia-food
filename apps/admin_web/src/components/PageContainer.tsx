import React from 'react';
import { adminDesignTokens } from '../theme/tokens';

interface PageContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, style }) => {
  return (
    <div
      style={{
        padding: adminDesignTokens.padding.lg,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: adminDesignTokens.colors.background,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

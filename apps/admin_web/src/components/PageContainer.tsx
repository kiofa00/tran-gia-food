import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '', style }) => {
  return (
    <div
      className={`p-8 min-h-[calc(100vh-64px)] bg-gray-50 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

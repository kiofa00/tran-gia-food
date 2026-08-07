import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`page-container py-10 min-h-[calc(100vh-64px)] bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

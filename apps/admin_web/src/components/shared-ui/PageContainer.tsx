import React from 'react';

import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('page-container py-10 min-h-[calc(100vh-64px)] bg-gray-50', className)}>
      {children}
    </div>
  );
};

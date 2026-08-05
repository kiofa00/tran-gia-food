import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Header';

describe('Header Component', () => {
  it('renders header title correctly', () => {
    render(<Header title="Dashboard Quản Trị" />);
    expect(screen.getByTestId('header-title')).toHaveTextContent('Dashboard Quản Trị');
  });

  it('renders user greeting when userName prop is provided', () => {
    render(<Header title="Dashboard" userName="Admin" />);
    expect(screen.getByTestId('user-greeting')).toHaveTextContent('Xin chào, Admin');
  });
});

import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('px-2 py-1', 'bg-orange-500')).toBe('px-2 py-1 bg-orange-500');
  });

  it('handles conditional class names', () => {
    const isActive = true;
    const isError = false;

    expect(cn('base', isActive && 'active', isError && 'error')).toBe('base active');
  });

  it('merges conflicting Tailwind classes using tailwind-merge', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });
});

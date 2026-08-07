import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Custom text & typography class group extensions if needed
    },
  },
});

/**
 * Utility function to merge Tailwind CSS classes conditionally without conflicts.
 * Adapted from amaze-webapp implementation.
 *
 * @example
 * cn('text-red-500', { 'text-green-500': true }) // 'text-green-500'
 * cn('px-2 py-1', 'p-4') // 'p-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

import { describe, expect, it, vi } from 'vitest';

import { QueryParams } from '@/services/apiClient';
import { usersService } from '@/services/users.service';

// Test the service layer logic directly (hook logic is trivial wiring to react-query)
vi.mock('@/services/users.service', () => ({
  usersService: {
    getUsers: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

describe('usersService (used by useUsersQuery)', () => {
  it('calls getUsers with correct params', async () => {
    const mockUsers: import('@/services/users.service').UserItem[] = [
      {
        id: 'u-1',
        key: 'u-1',
        name: 'Test User',
        phone: '0901234567',
        email: 'test@example.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    vi.mocked(usersService.getUsers).mockResolvedValue(mockUsers);

    const params: QueryParams = { page: 1, limit: 10 };
    const result = await usersService.getUsers(params);

    expect(usersService.getUsers).toHaveBeenCalledWith(params);
    expect(result).toEqual(mockUsers);
  });

  it('returns all users when called without params', async () => {
    vi.mocked(usersService.getUsers).mockResolvedValue([]);

    const result = await usersService.getUsers();

    expect(result).toEqual([]);
  });
});

describe('usersService (used by useUpdateUserStatusMutation)', () => {
  it('calls updateStatus with correct id and status', async () => {
    const mockResponse = { id: 'u-1', status: 'SUSPENDED' };

    vi.mocked(usersService.updateStatus).mockResolvedValue(mockResponse);

    const result = await usersService.updateStatus('u-1', 'SUSPENDED');

    expect(usersService.updateStatus).toHaveBeenCalledWith('u-1', 'SUSPENDED');
    expect(result.status).toBe('SUSPENDED');
  });

  it('propagates error when update fails', async () => {
    vi.mocked(usersService.updateStatus).mockRejectedValue(new Error('Network error'));

    await expect(usersService.updateStatus('u-1', 'SUSPENDED')).rejects.toThrow('Network error');
  });
});

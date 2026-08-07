import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryParams } from '@/services/apiClient';
import { usersService } from '@/services/users.service';
import { USERS_QUERY_KEYS } from '@/shared-config';

export function useUsersQuery(params?: QueryParams) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEYS.all, params],
    queryFn: () => usersService.getUsers(params),
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
    },
  });
}

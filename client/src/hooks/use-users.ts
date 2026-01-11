import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UserInput } from "@shared/routes";

export function useGetOrCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserInput) => {
      const res = await fetch(api.users.getOrCreate.path, {
        method: api.users.getOrCreate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error('Failed to authenticate user');
      }
      
      return api.users.getOrCreate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate any user-related queries if we had them
      // queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

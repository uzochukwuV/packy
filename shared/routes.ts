import { z } from 'zod';
import { insertUserSchema, users } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  users: {
    getOrCreate: {
      method: 'POST' as const,
      path: '/api/users',
      input: z.object({ walletAddress: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        201: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type UserInput = z.infer<typeof api.users.getOrCreate.input>;
export type UserResponse = z.infer<typeof api.users.getOrCreate.responses[200]>;

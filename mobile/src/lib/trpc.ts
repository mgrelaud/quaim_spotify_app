import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers';

export const trpc = createTRPCReact<AppRouter>();

// For Android emulator, use 10.0.2.2 instead of localhost
// In production, this would be your server's public URL
export const API_URL = 'http://10.0.2.2:3000/api/trpc';

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web'),
      '@awahouse/db': path.resolve(__dirname, 'packages/db/src'),
      '@awahouse/types': path.resolve(__dirname, 'packages/types/src'),
      '@trpc/server': path.resolve(__dirname, 'apps/web/node_modules/@trpc/server'),
      '@prisma/client': path.resolve(__dirname, 'node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client'),
    },
  },
});

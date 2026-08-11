import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/contexts/AuthContext.tsx',
        'src/hooks/useSyncedStorage.ts',
        'src/motor/seletor.ts',
        'src/utils/streakCalculator.ts',
      ],
    },
  },
});

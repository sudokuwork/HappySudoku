import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // 把 @sudoku 指向 src/sudoku 目录
      '@sudoku': path.resolve(__dirname, 'src/sudoku')
    }
  },
  
  // 如果你还希望在 Vite 环境里跑 Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/utils/**/*.js'],
      exclude: [
        'node_modules/**',
        'scripts/**',
        '**/*.config.js',
        'rollup.config.js',
        'tailwind.config.js',
        'src/main.js',
        'src/App.svelte',
        'src/components/**',
        'src/utils/candidateHelpers.js'
      ],
      lines: 75,
      functions: 80,
      branches: 70
    }
  }
});

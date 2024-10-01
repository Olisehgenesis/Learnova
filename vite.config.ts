
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['better-sqlite3']
  },
  build: {
    commonjsOptions: {
      include: [/better-sqlite3/, /node_modules/]
    }
  }
});
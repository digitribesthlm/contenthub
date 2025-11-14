import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load ALL environment variables (no prefix required)
    const env = loadEnv(mode, '.', '');
    
    // Define all env vars for the frontend
    const define: Record<string, string> = {};
    Object.keys(env).forEach(key => {
      define[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    });

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

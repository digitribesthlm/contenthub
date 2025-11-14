import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables - ONLY expose safe frontend vars
    const env = loadEnv(mode, '.', '');
    
    // Define env vars for the frontend (security: only whitelisted frontend vars)
    const define: Record<string, string> = {};
    const SAFE_VARS = [
      'API_URL',
      'GEMINI_API_KEY',
      'N8N_WEBHOOK_NEW_BRIEF',
      'N8N_WEBHOOK_PUBLISH',
      'N8N_WEBHOOK_SCHEDULE',
    ]; // Only these are safe for frontend
    
    Object.keys(env).forEach(key => {
      if (SAFE_VARS.includes(key)) {
        define[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      }
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

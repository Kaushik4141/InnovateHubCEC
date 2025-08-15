import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {   
    proxy: {
      '/api/v1': 'https://innovatehubcec.onrender.com',
      // Proxy Socket.IO in dev to deployed backend (update to your local backend if needed)
      '/socket.io': {
        target: 'https://innovatehubcec.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

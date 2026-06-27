import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          register: path.resolve(__dirname, 'register.html'),
          home: path.resolve(__dirname, 'home.html'),
          search: path.resolve(__dirname, 'search.html'),
          manual: path.resolve(__dirname, 'manual.html'),
          favorites: path.resolve(__dirname, 'favorites.html'),
          profile: path.resolve(__dirname, 'profile.html'),
          settings: path.resolve(__dirname, 'settings.html'),
          premium: path.resolve(__dirname, 'premium.html'),
          admin_login: path.resolve(__dirname, 'admin/login.html'),
          admin_dashboard: path.resolve(__dirname, 'admin/dashboard.html'),
          admin_manuals: path.resolve(__dirname, 'admin/manuals.html'),
          admin_users: path.resolve(__dirname, 'admin/users.html'),
          admin_analytics: path.resolve(__dirname, 'admin/analytics.html'),
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

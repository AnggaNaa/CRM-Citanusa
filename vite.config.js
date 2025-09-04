import path from "path";
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./resources/js"),
    },
  },
// //   server: {
// //     host: '192.168.1.93',
// //     port: 5175,
// //     hmr: {
// //       host: '192.168.1.93',
// //     },
//   },
});

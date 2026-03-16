import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router'],

          // UI libraries
          'radix-ui': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],

          // DnD Kit
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

          // React Query
          'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],

          // Form libraries
          'form-libs': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Icons and UI utilities
          'ui-utils': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge', 'sonner', 'cmdk'],

          // i18n
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],

          // Other utilities
          utils: [
            'axios',
            'date-fns',
            'jwt-decode',
            'lodash',
            'zustand',
            'next-themes',
            'react-day-picker',
            'dompurify'
          ],

          // PDF and File Handling
          pdf: ['pdfjs-dist', 'react-pdf', 'react-dropzone'],

          // Visualization and Charts
          charts: ['recharts'],

          // Animations and UI Extras
          animations: ['framer-motion', 'vaul']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})

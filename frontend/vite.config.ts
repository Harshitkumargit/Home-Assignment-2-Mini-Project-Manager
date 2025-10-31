import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // ✅ Load environment variables
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  return {
    plugins: [react()],
    
    // ✅ Development server configuration
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      // ✅ Proxy API calls in development
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          secure: false,
        }
      } : undefined
    },
    
    // ✅ Build optimization for production
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          // ✅ Code splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
            'axios-vendor': ['axios'],
          },
          // ✅ Optimize chunk naming
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: '[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
        external: [],
      },
      // ✅ Compression settings
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // ✅ Size limits
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
    },
    
    // ✅ Module resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    
    // ✅ Make environment variables available
    define: {
      'process.env': {},
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    
    // ✅ CSS configuration
    css: {
      postcss: './postcss.config.cjs',
      modules: {
        scopeBehaviour: 'local',
      },
    },
  }
})

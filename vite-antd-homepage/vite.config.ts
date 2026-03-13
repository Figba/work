import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mockApiPlugin } from './mockApiPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 在 Vite dev/preview 中提供 /api/* mock 接口，便于你先把页面流程跑通
    mockApiPlugin(),
  ],
  server: {
    // 允许云端/端口转发访问，避免本地 localhost 与云端地址不一致导致白屏
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    // 生产预览也保持相同策略，减少“能跑但打不开”的问题
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
})

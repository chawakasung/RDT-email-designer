import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sendEmailPlugin } from './vite-plugins/sendEmailPlugin.js'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.RESEND_API_KEY = env.RESEND_API_KEY || process.env.RESEND_API_KEY || ''
  return {
    plugins: [react(), sendEmailPlugin(), cloudflare()],
  };
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/loomi-m8pw.vercel.app/', 
  plugins: [
    tailwindcss(),
    react()
  ],
})

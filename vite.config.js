import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react()],
  server: {
    host: true, // <- esto permite exponer en red local
    port: 5173, // (opcional) puedes fijar el puerto si quieres
  }
})

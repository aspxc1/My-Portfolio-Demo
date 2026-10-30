import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // Lets the v0 preview (which runs on its own domain) reach the dev server.
    allowedHosts: true,
  },
})

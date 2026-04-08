import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "url"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.cts'
    },
    build: {
        chunkSizeWarningLimit: 1600,
        cssCodeSplit: false,
    },
    resolve: {
        alias: [
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
        ],
    },
    preview: {
        port: 5173
    },
    server:{
        open: true,
    }
})

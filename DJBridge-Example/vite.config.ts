import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "./", // 设置为相对路径
    build: {
        outDir: "./dist",
    },
});

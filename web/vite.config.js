import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Proxy keeps API same-origin in dev, so SameSite=Strict auth cookies work.
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://localhost:4000', '/auth': 'http://localhost:4000' } } });

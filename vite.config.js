import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE PATH
//  - Vercel / Netlify / your own domain:  "/"            (default, nothing to set)
//  - GitHub Pages project site:           "/<repo-name>/" (the workflow sets VITE_BASE for you)
const base = (process.env.VITE_BASE || '/').replace(/\/?$/, '/');

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173 },
});

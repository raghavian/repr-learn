import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace <repo-name> with your GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/repr-learn/'
});



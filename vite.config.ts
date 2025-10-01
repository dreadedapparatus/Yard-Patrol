import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json';

const repoName = packageJson.homepage.substring(packageJson.homepage.indexOf('.io/') + 4);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/Yard-Patrol/`,
})

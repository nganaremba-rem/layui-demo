import { defineConfig } from 'vite';
import { resolve } from 'path';

// MIME type mapping for face-api.js weight files
const weightFileTypes = {
  'manifest.json': 'application/json',
  'model.json': 'application/json',
  shard1: 'application/octet-stream',
  shard2: 'application/octet-stream',
  'weights_manifest.json': 'application/json',
};

export default defineConfig({
  server: {
    port: 3000,
    // Configure middleware to handle weight files
    middlewares: [
      async (req, res, next) => {
        if (req.url?.includes('/face-api.js/weights/')) {
          const fileName = req.url.split('/').pop();
          const fileExtension = fileName?.split('.').pop() || '';

          // Set correct MIME type based on file extension or name
          const mimeType =
            weightFileTypes[fileExtension] ||
            weightFileTypes[fileName || ''] ||
            'application/octet-stream';

          res.setHeader('Content-Type', mimeType);
        }
        next();
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),
      },
    },
  },
  // Properly handle weight files during build
  assetsInclude: ['**/*.json', '**/shard1', '**/shard2', '**/*.bin'],
  // Configure static file serving
  publicDir: 'public',
  // Preserve file names for weight files
  experimental: {
    renderBuiltUrl(filename, { type, hostId, hostType }) {
      if (filename.includes('face-api.js/weights/')) {
        return filename;
      }
      return filename;
    },
  },
});

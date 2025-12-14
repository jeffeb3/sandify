import fs from 'fs/promises';
import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(() => ({
  server: {
    port: 3000
  },
  plugins: [
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "tinyqueue": path.join(__dirname, 'node_modules', 'tinyqueue', 'index.js')
    }
  },
  build: {
    outDir: 'build',
    target: 'esnext',
  },
  // We use this configuration to treat .js file as .jsx. In the future we should rename them all
  // to .jsx instead and remove this config
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({ buffer: false, process: true }),
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFile(args.path, "utf8"),
            }));
          },
        },
      ],
    },
  },
}));

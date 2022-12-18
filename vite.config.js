import fs from 'fs/promises';
import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export default defineConfig(() => ({
  server: {
    port: 3000
  },
  plugins: [react()],
  resolve: {
    alias: {
      process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      timers: "rollup-plugin-node-polyfills/polyfills/timers",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      util: "rollup-plugin-node-polyfills/polyfills/util",
      buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    rollupOptions: {
      plugins: [nodePolyfills()],
    }
  },
  define: {
    "process.env": process.env ?? {},
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
        NodeGlobalsPolyfillPlugin({ buffer: true }),
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

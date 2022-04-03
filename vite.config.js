import fs from 'fs/promises';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => ({
  plugins: [react()],
  // We use this configuration to treat .js file as .jsx. In the future we should rename them all to .jsx instead and remove this config
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  resolve: {
    alias: {
      // necessary to load gcode-toolpath
      'stream': 'stream-browserify'
    }
  },
  define: {
    // necessary to load stream-browserify, required by gcode-toolpath
    global: {}
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
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

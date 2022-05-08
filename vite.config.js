import fs from 'fs/promises';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: {
      // necessary to load gcode-toolpath
      'stream': 'stream-browserify',
    }
  },
  build: {
    outDir: 'build'
  },
  // We use this configuration to treat .js file as .jsx. In the future we should rename them all to .jsx instead and remove this config
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
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

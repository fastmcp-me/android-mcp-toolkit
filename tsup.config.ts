import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs'],
  target: 'node18',
  platform: 'node',
  clean: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  dts: false,
  shims: false,
  treeshake: false
});

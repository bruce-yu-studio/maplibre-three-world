import { defineConfig } from 'tsup';


const sameConfig = {
  entry: [
    'src/index.ts',
  ],
  splitting: false,
  sourcemap: true,
}


export default defineConfig([
  {
    format: 'esm',
    minify: false,
    clean: true,
    dts: true,
    skipNodeModulesBundle: true,
    ...sameConfig,
  },
  {
    format: 'iife',
    minify: true,
    clean: false, // Avoid to cover esm
    globalName: 'ThreeWorld',
    ...sameConfig,
  },
]);

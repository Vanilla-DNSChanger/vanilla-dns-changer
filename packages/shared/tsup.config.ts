import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'interfaces/index': 'src/interfaces/index.ts',
    'validators/index': 'src/validators/index.ts',
    'constants/index': 'src/constants/index.ts',
    'platforms/index': 'src/platforms/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});

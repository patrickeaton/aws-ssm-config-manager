import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { cleandir } from "rollup-plugin-cleandir";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'commonjs',
      inlineDynamicImports: true,
      minifyInternalExports: true
    },
  ],
  plugins: [
    cleandir('dist/'),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    typescript({
      clean: true,
      tsconfig: './tsconfig.build.json',
    }),
    commonjs({
      ignoreDynamicRequires: true,
    }),
    uglify(),
    json(),
  ],
};

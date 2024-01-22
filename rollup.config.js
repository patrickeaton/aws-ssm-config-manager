
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import analyze from 'rollup-plugin-analyzer'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.es.js',
      format: 'es'
    },
    {
      file: 'dist/index.js',
      format: 'commonjs'
    }
  ],
  plugins: [
    analyze({ limit: 10}),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    typescript({
      clean: true,
      tsconfig: './tsconfig.build.json',
    }),
    commonjs(),
    json()
  ],
};

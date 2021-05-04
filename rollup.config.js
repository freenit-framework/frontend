import babel from 'rollup-plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image'
import visualizer from 'rollup-plugin-visualizer'
import json from '@rollup/plugin-json'
import pkg from './package.json'

export default {
  input: './src/lib.js',
  output: [
    {
      file: `dist/${pkg.main}`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `dist/${pkg.module}`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    external(),
    babel({ exclude: 'node_modules/**' }),
    resolve({ preferBuiltins: true }),
    commonjs(),
    image(),
    visualizer(),
  ],
}

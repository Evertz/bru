import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import sourcemaps from 'rollup-plugin-sourcemaps';

module.exports = {
  onwarn: () => {},
  external: [],
  output: { name: 'bundle' },
  plugins: [
    json({preferConst: true}),
    sourcemaps(),
    nodeResolve({
      mainFields: ['browser', 'es2015', 'module', 'jsnext:main', 'main']
    }),
    commonjs()
  ],
};

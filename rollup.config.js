import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.mjs',
    output: {
        file: 'dist/RedPipeFlow.cjs',
        format: 'cjs',
        name: 'RedPipeFlow'
    },
    plugins: [
        resolve(),
        commonjs(),
        terser()
    ]
};
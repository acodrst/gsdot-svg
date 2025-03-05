import { nodeResolve } from '@rollup/plugin-node-resolve';
import { createRollupLicensePlugin } from 'rollup-license-plugin';
import terser from '@rollup/plugin-terser';
export default 
{
  input: 'src/app.js',
  output: {file: 'dist/gsdot-svg.bundle.js'},
  plugins: [terser({ maxWorkers: 8,module:true }),
    nodeResolve(),
    createRollupLicensePlugin({ outputFilename: 'gsdot-svg_licenses.json' })]
}


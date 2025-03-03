import { nodeResolve } from '@rollup/plugin-node-resolve';
import { createRollupLicensePlugin } from 'rollup-license-plugin';
export default 
{
  input: 'src/app.js',
  output: {file: 'dist/gsdot-svg.bundle.js'},
  plugins: [nodeResolve(),createRollupLicensePlugin({ outputFilename: 'gsdot-svg_licenses.json' })]
}


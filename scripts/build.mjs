import { build } from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const config = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  external: ['betterdiscord'],
  sourcemap: true,
  plugins: [dtsPlugin()],
  define: {
    'process.env.VERSION': JSON.stringify(packageJson.version),
  },
};

async function main() {
  await build({
    ...config,
    outfile: 'dist/index.js',
    format: 'cjs',
  });

  await build({
    ...config,
    outfile: 'dist/index.esm.js',
    format: 'esm',
  });
}

main();

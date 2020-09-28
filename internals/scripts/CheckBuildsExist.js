// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const mainPath = path.join(__dirname, '..', '..', 'app', 'main.prod.js');
const mainWindowRendererPath = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'dist',
  'mainWindow.renderer.prod.js'
);

const peerConnectionHelperRendererWindowPath = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'dist',
  'peerConnectionHelperRendererWindow.renderer.prod.js'
);

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "yarn build-main"'
    )
  );
}

if (!fs.existsSync(mainWindowRendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The renderer process is not built yet. Build it by running "yarn build-renderer"'
    )
  );
}

if (!fs.existsSync(peerConnectionHelperRendererWindowPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The mousePointer renderer process is not built yet. Build it by running "yarn build-renderer"'
    )
  );
}

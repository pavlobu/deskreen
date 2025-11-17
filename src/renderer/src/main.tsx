// override console early to catch all logs in renderer
import { overrideGlobalConsole, startConsoleRateLimiting } from '../../common/rateLimitedConsole';
overrideGlobalConsole();
startConsoleRateLimiting();

import './assets/main.css';
import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import Root from './containers/Root';
import { i18nInitPromise } from './configs/i18next.config.client';

document.addEventListener('DOMContentLoaded', () => {
  const windowTopBar = document.createElement('div');
  windowTopBar.style.width = '75%';
  windowTopBar.style.height = '50px';
  windowTopBar.style.position = 'absolute';
  windowTopBar.style.top = '0';
  windowTopBar.style.left = '0';
  // @ts-ignore: all good here
  windowTopBar.style.webkitAppRegion = 'drag';
  windowTopBar.style.pointerEvents = 'none';

  document.body.appendChild(windowTopBar);
});

i18nInitPromise.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback="loading">
        <Root />
      </Suspense>
    </StrictMode>,
  );
});
// });

window.onbeforeunload = () => {
  window.electron.ipcRenderer.invoke('main-window-onbeforeunload');
};

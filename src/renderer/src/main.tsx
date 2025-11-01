import './assets/main.css';
import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import Root from './containers/Root';
// import i18n from './configs/i18next.config';
import i18nClient from './configs/i18next.config.client';

// i18n.init();
i18nClient.init();

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback="loading">
      <Root />
    </Suspense>
    ,
  </StrictMode>,
);
// });

window.onbeforeunload = () => {
  window.electron.ipcRenderer.invoke('main-window-onbeforeunload');
};

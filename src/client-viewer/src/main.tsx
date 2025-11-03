import { initializeGARequestInterceptor } from './utils/gaRequestInterceptor';

// initialize GA request interceptor immediately to block requests before consent
initializeGARequestInterceptor();

import {StrictMode, Suspense} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './config/i18n';
import App from './App.tsx'
import { AppContextProvider } from './providers/AppContextProvider';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback="loading">
    <AppContextProvider>

    <App />
    </AppContextProvider>
    </Suspense>
  </StrictMode>,
)

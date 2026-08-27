import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { RenderContextProvider } from './context/RenderContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RenderContextProvider>
            <App />
        </RenderContextProvider>
    </React.StrictMode>
);

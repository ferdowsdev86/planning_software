import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toast } from '@bryntum/schedulerpro';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

// <test>
!document.location.search.includes('test') &&
// </test>
Toast.show({
    html : `<p>This demo uses the <a href='https://bryntum.com/products/grid/'>Bryntum Grid</a> component which is licensed separately.</p>
    `,
    timeout : 10000
});

import { ClientOnly } from 'remix-utils/client-only';
import BryntumClient from '~/components/bryntum.client';

export const links = () => [
    { rel : 'icon', href : '/favicon.png', type : 'image/png' },
    // Bryntum component theme
    {
        rel                  : 'stylesheet',
        href                 : 'themes/svalbard-light.css',
        'data-bryntum-theme' : true
    }
];

export default function Index() {
    return (
        <>
            <ClientOnly fallback={<h1>Loading Bryntum Scheduler Pro</h1>}>
                {() => <BryntumClient/>}
            </ClientOnly>
        </>
    );
}

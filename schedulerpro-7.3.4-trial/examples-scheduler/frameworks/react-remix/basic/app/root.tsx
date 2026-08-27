import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <title>Bryntum Scheduler - Basic setup with Remix (Typescript)</title>
                <meta name="description" content="This demo contains the React Scheduler wrapper and the demo is written in Remix using Typescript."/>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
export default function App() {
    return <Outlet />;
}

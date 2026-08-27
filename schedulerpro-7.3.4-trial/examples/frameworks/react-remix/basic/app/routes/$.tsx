import { json } from '@remix-run/node';
import { useRouteError } from '@remix-run/react';

/**
 * Catch-all route to handle unmatched requests gracefully
 * Specifically handles Chrome DevTools and source map requests that cause 404 errors
 */
export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle Chrome DevTools requests
    if (pathname.includes('.well-known/appspecific/com.chrome.devtools.json')) {
        return json({}, { status : 404 });
    }

    // Handle source map requests
    if (pathname.endsWith('.map')) {
        return json({}, { status : 404 });
    }

    // For other unmatched routes, throw a 404
    throw new Response('Not Found', { status : 404 });
}

/**
 * Default component for catch-all route
 * Returns null to prevent "empty page" warnings
 */
export default function CatchAllRoute() {
    return null;
}

/**
 * Error boundary for catch-all route
 * Handles errors gracefully without cluttering the console
 */
export function ErrorBoundary() {
    const error = useRouteError();

    // Don't render anything for 404 errors to keep console clean
    if (error instanceof Response && error.status === 404) {
        return null;
    }

    return (
        <div>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred.</p>
        </div>
    );
}

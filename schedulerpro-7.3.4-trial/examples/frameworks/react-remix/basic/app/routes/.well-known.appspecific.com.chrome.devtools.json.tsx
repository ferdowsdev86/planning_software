import { json } from '@remix-run/node';

/**
 * Route to handle Chrome DevTools requests
 * Chrome DevTools automatically requests this file to check for debugging capabilities
 * Returns empty JSON to prevent 404 errors in the console
 */
export async function loader() {
    return json({});
}

/**
 * Default component for Chrome DevTools route
 * Returns null to prevent "empty page" warnings
 */
export default function ChromeDevToolsRoute() {
    return null;
}

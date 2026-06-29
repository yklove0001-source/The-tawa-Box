/**
 * Utility to dynamically resolve absolute API endpoints depending on the current host.
 * This ensures that if the frontend is hosted statically on a custom domain (like thetawabox.com),
 * it falls back gracefully to our production backend running on Cloud Run.
 */
export const getApiUrl = (path: string): string => {
  const host = window.location.hostname;
  
  // If we are on localhost, local IP, or the standard AI Studio Cloud Run domains,
  // we can safely use the relative path.
  if (host === 'localhost' || host === '127.0.0.1' || host.includes('run.app')) {
    return path;
  }
  
  // Otherwise, use the production Cloud Run URL as the primary API base URL.
  const backendBase = 'https://ais-pre-pex32jx3tuc635zxesw4ph-588252797586.asia-southeast1.run.app';
  
  // Strip duplicate leading slash if any
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendBase}${cleanPath}`;
};

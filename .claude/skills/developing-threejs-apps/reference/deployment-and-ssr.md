# Deployment and SSR Pitfalls

---

## SSR (Next.js and similar)

Do not create WebGL/WebGPU renderers on the server.

Rules:

- Initialize renderers only in client-only lifecycle hooks (`useEffect`, onMount, etc.).
- Avoid importing WebGL-only modules in server code paths.
- If needed, dynamically import Three.js view components with SSR disabled.

## Asset paths

Deployment environments often change asset base paths.

- Confirm how the repo serves static files.
- Confirm whether there is a `basePath`, `assetPrefix`, or CDN configuration.
- Prefer using existing asset helpers rather than hardcoding paths.

## CORS and remote assets

If loading remote textures/models:

- Ensure correct CORS headers.
- Consider caching or bundling if reliability is required.

## Production performance

- Ensure DPR policy is appropriate.
- Avoid debug helpers and verbose logs in production.
- Confirm that large assets are not bundled unintentionally in the JS bundle (use the repo’s asset pipeline).

## Error handling

In production, make loader failures actionable:

- log the URL
- surface a user-friendly message if appropriate
- avoid silent failures that result in blank output

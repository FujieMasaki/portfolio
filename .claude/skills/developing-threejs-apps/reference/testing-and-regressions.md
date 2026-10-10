# Testing and Regression Prevention

Three.js regressions often show up as visual issues or performance leaks rather than unit test failures.

---

## Minimum manual regression suite

After a change, verify:

- Initial load renders correctly (no blank screen)
- Resize works (no stretched aspect ratio)
- Navigation away and back does not create duplicate loops
- GPU memory does not grow without bound after repeated navigation
- Mobile or low-power devices remain usable (DPR cap works)

## Automated options (if the repo already has them)

- Screenshot-based visual regression tests (Playwright or similar)
- Performance smoke tests (basic fps threshold on a known scene)
- Lint rules that prevent server-side renderer creation in SSR contexts

Do not introduce new heavy testing frameworks unless requested. Prefer using what the repo already uses.

## Debug-friendly toggles

For complex features, consider adding:

- a feature flag to disable postprocessing
- a fallback material mode (basic or normal) for shader debugging
- a wireframe toggle

Keep toggles developer-facing unless the product needs them.

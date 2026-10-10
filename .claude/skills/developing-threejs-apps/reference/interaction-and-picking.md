# Interaction and Picking

Picking and interaction bugs are often caused by coordinate mismatches and lifecycle mistakes.

---

## Coordinate conversion

For a canvas or container element:

1. Get bounding rect: `dom.getBoundingClientRect()`
2. Convert pointer to normalized device coordinates (NDC):
   - x in [-1, 1]
   - y in [-1, 1] with Y inverted

Use the same DOM element you measure for event coordinates.

## Raycasting

- Reuse a single `Raycaster` and `Vector2` to avoid per-frame allocations.
- Intersect only the relevant subtree, not the entire scene, when possible.

## Filtering

Ways to restrict pick targets:

- Separate group: `pickRoot`
- Layers: set `object.layers` and `camera.layers`
- Tags: `userData.pickable = true`

## Hover and selection policies

Define a clear UX:

- hover highlight (material swap or outline)
- click selection (persist selection state)
- drag manipulation (optional)

Avoid creating and disposing new materials on every hover event.

## Performance

- Avoid raycasting against huge static scenes every frame.
- For large scenes, consider:
  - spatial partitioning
  - simplified collision proxies
  - limiting raycast frequency

## Lifecycle

Always remove event listeners on teardown.

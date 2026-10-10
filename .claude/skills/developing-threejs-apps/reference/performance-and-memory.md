# Performance and Memory

Triage first, then optimize the dominant bottleneck.

## Quick Metrics

Log periodically (throttled):
```ts
renderer.info.render.calls      // draw calls
renderer.info.render.triangles  // triangle count
renderer.info.memory.textures   // texture count
renderer.info.memory.geometries // geometry count
```

## Bottleneck Categories

### 1) Too Many Draw Calls (CPU)

**Signals:** High `calls` + high CPU frame time; lowering resolution doesn't help

**Fixes (by leverage):**
- `InstancedMesh` for repeated objects
- Reduce material count / state changes
- Merge static meshes (build-time)
- Reduce separate skinned meshes

### 2) Too Many Pixels (Fill Rate)

**Signals:** Performance collapses on high DPI; improves when lowering DPR

**Fixes:**
- Cap DPR (1-2)
- Lower resolution for expensive passes
- Reduce overdraw (transparent layers)
- Reduce shadow map resolution

### 3) Texture Pressure (VRAM)

**Signals:** Stutters on new content; GPU memory grows; mobile crashes

**Fixes:**
- Reduce texture resolution
- Reduce unique textures/materials
- Use GPU-compressed textures (KTX2)
- Reuse environment maps

### 4) GC Jank

**Signals:** Frequent GC pauses; many temp objects per frame

**Fixes:**
- Reuse `Vector3`, `Matrix4`, arrays
- Avoid per-frame `new` in hot paths
- Typed arrays for particles
- Throttle event handlers

### 5) Shader Compilation Stutter

**Signals:** "First time I look at it" hitch

**Fixes:**
- Compile/warm-up after assets load
- Defer non-critical effects until first paint

## Shadow Costs

Expensive, scales with:
- Shadow-casting lights count
- Shadow map resolution
- Casters/receivers count
- Update frequency

**Optimizations:** Reduce map size, restrict casting to important meshes, freeze for static scenes.

## Memory Leak Checklist

If memory grows:
- [ ] Render loops not duplicated on route changes
- [ ] Event listeners/observers removed
- [ ] Disposed: geometries, materials, textures, render targets, composers, PMREM

## Shipping Advice

- Make improvements measurable and reversible
- Document trade-offs (quality vs FPS)
- Few high-leverage changes > many micro-optimizations

# Three.js Playbooks

Step-by-step runbooks for common tasks. Focus: minimal diffs, lifecycle safety, verification.

## Index

**Debugging:**
- [Blank screen](#blank-screen)
- [Color issues after postprocessing](#fix-colors-after-postprocessing)
- [Transparency artifacts](#transparency-artifacts)
- [Shadow acne/peter-panning](#shadow-issues)

**Setup:**
- [Add Three.js view to app](#add-threejs-view-to-app)
- [Load glTF model](#load-gltf-model)
- [Add postprocessing (WebGL)](#add-postprocessing-webgl)
- [Add picking](#add-picking)

**Performance:**
- [Fix GPU memory leak](#fix-gpu-memory-leak)
- [Performance triage](#performance-triage)
- [Reduce first-interaction stutter](#reduce-first-interaction-stutter)

**Migration:**
- [Add WebGPU incrementally](#add-webgpu-incrementally)

---

## Blank Screen

**Goal**: Find the broken link with minimal guesswork.

1. **Render loop runs?** → Add `console.log("tick")` (throttled)
2. **Replace materials** → Use `MeshNormalMaterial`, add `AxesHelper` + cube
3. **Canvas sizing** → CSS size > 0? `setSize()` uses correct element?
4. **Camera** → near/far reasonable? Looking at object?
5. **Disable postprocessing** → Render directly with `renderer.render(scene, camera)`
6. **Only then check color** → Wrong colors rarely cause blank screen

**Common causes:**
- Loop not started / stopped early
- Canvas width/height = 0 (CSS)
- Camera inside geometry or pointing away
- Postprocessing output missing

---

## Add Three.js View to App

1. Locate DOM container owner (component/page)
2. Implement `createThreeApp(canvas) → { resize, update, render, dispose }`
3. Bind to framework lifecycle:
   - React: `useEffect(() => { app = create(); return () => app.dispose(); }, [])`
   - Vue/Svelte: mount/unmount hooks
4. Bind resize: `ResizeObserver` on canvas/container
5. Remove event listeners on teardown

**Verify:** Navigate away → resources freed. Navigate back → fresh scene, no duplicate loops.

---

## Load glTF Model

1. Use repo's existing loader utilities if present
2. `GLTFLoader.loadAsync(url)`
3. Add to dedicated `Group` (scale/position/dispose as unit)
4. Frame camera: compute bounding box → set camera + controls target
5. Add environment: `scene.environment = pmremTexture` for PBR
6. Enable DRACO/KTX2/meshopt only if needed

**Verify:** Model visible, correct normals, responds to lighting.

**Pitfalls:** Missing env map, wrong texture color spaces, huge textures.

---

## Add Postprocessing (WebGL)

**Precondition:** Using `WebGLRenderer`

1. Create `EffectComposer(renderer)` + `RenderPass(scene, camera)`
2. Add effect passes
3. Add `OutputPass()` at end of linear chain (tone mapping + color space)
4. Passes needing sRGB (FXAA) go **AFTER** OutputPass
5. Replace `renderer.render()` with `composer.render()`
6. On resize: both `renderer.setSize()` and `composer.setSize()`

**Verify:** No double tone mapping. Output matches baseline + intended effects.

**Pitfalls:** Forgetting composer resize, output transforms in multiple places, mixing WebGL/WebGPU.

---

## Fix Colors After Postprocessing

**Symptom:** Washed out, too dark, or oversaturated.

1. **Baseline check** → Render without composer. If wrong, issue isn't composer.
2. **OutputPass present?** → Must be near end. sRGB passes (FXAA) go after.
3. **Double transforms?** → Search for legacy + modern color APIs, custom gamma in shaders.
4. **Texture color spaces** → Base color/emissive: sRGB. Normal/roughness/metalness/AO: linear.
5. **Exposure/tone mapping** → Match repo baseline.

**Verify:** Side-by-side comparison acceptable. No milky whites or crushed blacks.

See: `reference/color-management.md`, `reference/postprocessing-webgl.md`

---

## Add Picking

1. Decide interaction space (canvas or parent container)
2. Track pointer in NDC coordinates
3. `Raycaster.setFromCamera(ndc, camera)` → intersect root
4. Use dedicated group or `layers` for filtering
5. Define hover/click policy (material swap, outline, UI label)

**Verify:** Works after resize/DPR changes. Selection matches visual positions.

**Pitfalls:** Wrong DOM rect, picking invisible proxies.

---

## Transparency Artifacts

**Symptom:** Wrong ordering, alpha fringes, flickering.

1. **Cutout or blend?** → Cutouts: use `alphaTest`, not `transparent`
2. **Depth flags** → Blended transparency usually needs `depthWrite = false`
3. **Ordering issues** → Set `renderOrder` for known layers (e.g., UI planes)
4. **Geometry** → Split large transparent surfaces for better sorting

**Verify:** Overlap fixed. Overdraw acceptable on mobile.

See: `reference/transparency-and-ordering.md`

---

## Shadow Issues

**Symptom:** Shadow acne (self-intersection) or peter-panning (floating shadows).

1. Confirm scene scale and camera near/far are reasonable
2. Reduce shadow map resolution only if needed
3. Tune bias carefully (small changes, per-light)
4. Reduce shadow casters/receivers count

**Verify:** Shadows stable across camera movement. Performance acceptable.

See: `reference/lighting-and-shadows.md`

---

## Fix GPU Memory Leak

1. **Identify created resources** → geometries, materials, textures, render targets, composers, PMREM
2. **Teardown runs once** → Stop RAF/setAnimationLoop, remove listeners/observers
3. **Remove from scene before dispose**
4. **Dispose GPU resources:**
   - `geometry.dispose()`
   - `material.dispose()`
   - `texture.dispose()`
   - `renderTarget.dispose()`
5. **Test:** Repeated mount/unmount cycles

**Verify:** GPU memory stabilizes. Draw calls and texture counts don't grow.

---

## Performance Triage

**First hour approach:**

1. **Log metrics:**
   - `renderer.info.render.calls` (draw calls)
   - `renderer.info.render.triangles`
   - `renderer.info.memory.textures`

2. **Identify bottleneck:**
   - Too many draw calls → CPU bound
   - Too many pixels → fill rate
   - Too much VRAM → textures/bandwidth
   - Stutter → compilation/uploads

3. **Apply high-leverage fix:**
   - Draw calls → instancing/batching
   - Fill rate → DPR cap, reduce postFX resolution
   - VRAM → texture compression, smaller sizes

**Verify:** Frame time improves. Visual quality loss documented and acceptable.

See: `reference/performance-and-memory.md`

---

## Reduce First-Interaction Stutter

**Symptom:** First hover/camera move/object appearance causes hitch.

1. Capture profile of hitch (Performance panel)
2. Determine cause: shader compile, texture upload, asset decode
3. Apply targeted warm-up:
   - Compile once after assets load
   - Defer expensive postFX until after first paint
4. Avoid creating new materials during interaction

**Verify:** First interaction smooth. Startup time acceptable.

See: `reference/stutter-and-precompile.md`

---

## Add WebGPU Incrementally

1. **Requirement check** → Product requirement or experiment?
2. **Renderer selection:**
   - Prefer WebGPU if supported
   - Fallback to WebGL
3. **Keep scene graph renderer-agnostic**
4. **Postprocessing is renderer-specific:**
   - WebGL postFX → WebGL branch only
   - WebGPU postprocessing → separate implementation
5. **Validate:** WebGPU browser + fallback browser

**Verify:** WebGPU renders correctly when supported. WebGL fallback unchanged.

**Pitfalls:** Copying WebGL postFX to WebGPU path, renderer-specific shader assumptions.

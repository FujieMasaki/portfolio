# Three.js Code Examples

Copy/paste patterns for real repositories. **Adapt imports to match repo style** (`three/addons/...` vs `three/examples/jsm/...`).

## Index

**Lifecycle & Setup:**
1. [App lifecycle (vanilla)](#1-app-lifecycle-vanilla)
2. [Resize handling](#2-resize-handling)
3. [Disposal helpers](#3-disposal-helpers)

**Assets:**
4. [glTF loading (DRACO/KTX2)](#4-gltf-loading)
5. [Environment map (PMREM)](#5-environment-map)

**Rendering:**
6. [Postprocessing (EffectComposer)](#6-postprocessing-effectcomposer)
10. [WebGPU renderer](#10-webgpu-renderer)
11. [Adaptive DPR](#11-adaptive-dpr)
12. [Freeze shadows](#12-freeze-shadows)

**Interaction:**
7. [Raycasting picker](#7-raycasting-picker)
13. [GPU picking](#13-gpu-picking)

**Performance:**
8. [InstancedMesh](#8-instancedmesh)
14. [Instance colors](#14-instance-colors)
15. [Dynamic BufferAttribute](#15-dynamic-bufferattribute)
16. [LOD setup](#16-lod-setup)

**Shaders:**
9. [onBeforeCompile](#9-onbeforecompile)

---

## 1) App Lifecycle (vanilla)

Complete init/resize/loop/dispose pattern.

```ts
import * as THREE from "three";

export type ThreeApp = {
  resize: () => void;
  update: (dt: number) => void;
  render: () => void;
  dispose: () => void;
};

export function createThreeApp(canvas: HTMLCanvasElement): ThreeApp {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(0, 1.5, 4);

  const root = new THREE.Group();
  scene.add(root);

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
  root.add(mesh);

  let rafId: number | null = null;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function update(dt: number) { mesh.rotation.y += dt * 0.7; }
  function render() { renderer.render(scene, camera); }

  function tick(prev = performance.now()) {
    rafId = requestAnimationFrame(() => tick(prev));
    const now = performance.now();
    update(Math.min((now - prev) / 1000, 0.05));
    render();
  }

  function dispose() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    root.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
    else mesh.material.dispose();
    renderer.dispose();
  }

  return { resize, update, render, dispose };
}
```

---

## 2) Resize Handling

```ts
function bindResize(canvas: HTMLCanvasElement, onResize: () => void) {
  const ro = new ResizeObserver(() => onResize());
  ro.observe(canvas);

  const media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  const onChange = () => onResize();
  media.addEventListener?.("change", onChange);

  return () => {
    ro.disconnect();
    media.removeEventListener?.("change", onChange);
  };
}
```

---

## 3) Disposal Helpers

> **Warning**: Only dispose resources you own. Shared resources (cached glTFs, atlases) need reference counting.

```ts
import * as THREE from "three";

const TEXTURE_KEYS = [
  "map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap",
  "alphaMap", "envMap", "lightMap", "bumpMap", "displacementMap",
  "clearcoatMap", "clearcoatNormalMap", "clearcoatRoughnessMap",
  "iridescenceMap", "iridescenceThicknessMap", "sheenColorMap", "sheenRoughnessMap",
  "specularMap", "specularIntensityMap", "specularColorMap", "transmissionMap", "thicknessMap",
];

export function disposeMaterial(mat: THREE.Material) {
  const anyMat = mat as any;
  for (const k of TEXTURE_KEYS) {
    const tex = anyMat[k] as THREE.Texture | null | undefined;
    if (tex?.isTexture) tex.dispose();
  }
  mat.dispose();
}

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    if (Array.isArray(mat)) mat.forEach(disposeMaterial);
    else disposeMaterial(mat);
  });
}

export function disposeRenderTarget(rt: THREE.WebGLRenderTarget) {
  rt.texture.dispose();
  rt.dispose();
}
```

---

## 4) glTF Loading

Enable DRACO/KTX2/meshopt only if repo uses them or asset requires it.

```ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

export async function loadGltf(
  renderer: THREE.WebGLRenderer,
  url: string,
  opts: { dracoDecoderPath?: string; ktx2TranscoderPath?: string; meshoptDecoder?: any } = {}
) {
  const loader = new GLTFLoader();

  if (opts.dracoDecoderPath) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(opts.dracoDecoderPath);
    loader.setDRACOLoader(draco);
  }

  if (opts.ktx2TranscoderPath) {
    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath(opts.ktx2TranscoderPath);
    ktx2.detectSupport(renderer);
    loader.setKTX2Loader(ktx2);
  }

  if (opts.meshoptDecoder) loader.setMeshoptDecoder(opts.meshoptDecoder);

  return loader.loadAsync(url);
}
```

---

## 5) Environment Map

```ts
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

export async function setEnvironmentFromHDRI(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  hdrUrl: string,
  opts: { setBackground?: boolean } = {}
) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const hdr = await new RGBELoader().loadAsync(hdrUrl);
  const envMap = pmrem.fromEquirectangular(hdr).texture;

  scene.environment = envMap;
  if (opts.setBackground) scene.background = envMap;

  hdr.dispose();
  pmrem.dispose();
  return envMap;
}
```

---

## 6) Postprocessing (EffectComposer)

OutputPass at end of linear chain. Passes needing sRGB (FXAA) go AFTER OutputPass.

```ts
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  size: THREE.Vector2
) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(size, 0.6, 0.4, 0.85));
  composer.addPass(new OutputPass()); // tone mapping + color space
  return composer;
}
// On resize: composer.setSize(w, h)
```

---

## 7) Raycasting Picker

```ts
import * as THREE from "three";

export function makePicker(camera: THREE.Camera, dom: HTMLElement) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function onPointerMove(ev: PointerEvent) {
    const rect = dom.getBoundingClientRect();
    ndc.set(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  function pick(root: THREE.Object3D) {
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(root, true)[0] ?? null;
  }

  dom.addEventListener("pointermove", onPointerMove);
  return { pick, dispose: () => dom.removeEventListener("pointermove", onPointerMove) };
}
```

---

## 8) InstancedMesh

```ts
import * as THREE from "three";

export function addInstancedBoxes(scene: THREE.Scene, count = 1000) {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.0 });
  const inst = new THREE.InstancedMesh(geom, mat, count);
  const tmp = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    tmp.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 50);
    tmp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    tmp.updateMatrix();
    inst.setMatrixAt(i, tmp.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  scene.add(inst);

  return () => { scene.remove(inst); geom.dispose(); mat.dispose(); };
}
```

---

## 9) onBeforeCompile

Extend MeshStandardMaterial without rewriting PBR.

```ts
import * as THREE from "three";

export function makeTintedStandardMaterial(tint: THREE.ColorRepresentation) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTint = { value: new THREE.Color(tint) };
    shader.fragmentShader = `uniform vec3 uTint;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>\ndiffuseColor.rgb *= uTint;`
    );
  };
  (mat as any).customProgramCacheKey = () => `tinted-standard-v1`;

  return mat;
}
```

---

## 10) WebGPU Renderer

Do not mix with WebGL postprocessing.

```ts
import * as THREE from "three";
import { WebGPURenderer } from "three/addons/renderers/webgpu/WebGPURenderer.js";

export async function createWebGPUApp(canvas: HTMLCanvasElement) {
  const renderer = new WebGPURenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 4);

  await renderer.init();

  function resize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  let stop = false;
  (function loop() { if (!stop) { renderer.render(scene, camera); requestAnimationFrame(loop); } })();

  return { scene, camera, renderer, resize, dispose: () => { stop = true; } };
}
```

---

## 11) Adaptive DPR

```ts
import * as THREE from "three";

export function makeAdaptiveDpr(renderer: THREE.WebGLRenderer, opts?: {
  min?: number; max?: number; targetFps?: number; adjustEveryNFrames?: number;
}) {
  const min = opts?.min ?? 1;
  const max = opts?.max ?? Math.min(window.devicePixelRatio || 1, 2);
  const targetFps = opts?.targetFps ?? 55;
  const every = opts?.adjustEveryNFrames ?? 30;

  let frame = 0, dpr = Math.min(max, renderer.getPixelRatio()), emaFps = targetFps;

  function update(dtSeconds: number) {
    frame++;
    emaFps = emaFps * 0.9 + (1 / Math.max(dtSeconds, 1e-6)) * 0.1;
    if (frame % every !== 0) return;
    if (emaFps < targetFps * 0.9) dpr = Math.max(min, dpr * 0.9);
    else if (emaFps > targetFps * 1.05) dpr = Math.min(max, dpr * 1.05);
    renderer.setPixelRatio(dpr);
  }

  return { update, getDpr: () => dpr };
}
```

---

## 12) Freeze Shadows

For static scenes only.

```ts
export function freezeShadows(renderer: THREE.WebGLRenderer) {
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  return () => { renderer.shadowMap.autoUpdate = true; };
}
```

---

## 13) GPU Picking

For click selection (pixel read is expensive).

```ts
import * as THREE from "three";

export function makeGpuPicker(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { depthBuffer: true });
  const pixel = new Uint8Array(4);
  const idToObject = new Map<number, THREE.Object3D>();

  function encodeId(id: number) {
    return new THREE.Color((id & 0xff) / 255, ((id >> 8) & 0xff) / 255, ((id >> 16) & 0xff) / 255);
  }

  function registerPickables(root: THREE.Object3D) {
    let nextId = 1;
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const id = nextId++;
      mesh.userData.__pickId = id;
      mesh.userData.__pickMaterial = new THREE.MeshBasicMaterial({ color: encodeId(id) });
      idToObject.set(id, mesh);
    });
  }

  function resize(w: number, h: number) { rt.setSize(w, h); }

  function pick(clientX: number, clientY: number, dom: HTMLElement) {
    const rect = dom.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * rt.width);
    const y = Math.floor(((rect.bottom - clientY) / rect.height) * rt.height);

    const saved = new Map<THREE.Object3D, THREE.Material | THREE.Material[]>();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.userData.__pickMaterial) return;
      saved.set(mesh, (mesh as any).material);
      (mesh as any).material = mesh.userData.__pickMaterial;
    });

    const prevRt = renderer.getRenderTarget();
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(rt, x, y, 1, 1, pixel);
    renderer.setRenderTarget(prevRt);

    for (const [obj, mat] of saved) (obj as any).material = mat;

    const id = pixel[0] | (pixel[1] << 8) | (pixel[2] << 16);
    const hit = idToObject.get(id);
    return hit ? { object: hit, id } : null;
  }

  function dispose() {
    rt.dispose();
    for (const obj of idToObject.values()) {
      (obj.userData.__pickMaterial as THREE.Material)?.dispose();
      delete obj.userData.__pickMaterial;
      delete obj.userData.__pickId;
    }
    idToObject.clear();
  }

  return { registerPickables, resize, pick, dispose };
}
```

---

## 14) Instance Colors

```ts
import * as THREE from "three";

export function colorizeInstances(inst: THREE.InstancedMesh) {
  const tmp = new THREE.Color();
  for (let i = 0; i < inst.count; i++) {
    tmp.setHSL(i / inst.count, 0.7, 0.5);
    inst.setColorAt(i, tmp);
  }
  if ((inst as any).instanceColor) (inst as any).instanceColor.needsUpdate = true;
}
```

---

## 15) Dynamic BufferAttribute

```ts
import * as THREE from "three";

export function makeDynamicPositions(count: number) {
  const positions = new Float32Array(count * 3);
  const attr = new THREE.BufferAttribute(positions, 3);
  attr.setUsage(THREE.DynamicDrawUsage);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", attr);

  function updateOne(i: number, x: number, y: number, z: number) {
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    attr.needsUpdate = true;
  }

  return { geom, updateOne };
}
```

---

## 16) LOD Setup

```ts
import * as THREE from "three";

export function makeLod(high: THREE.Object3D, mid: THREE.Object3D, low: THREE.Object3D) {
  const lod = new THREE.LOD();
  lod.addLevel(high, 0);
  lod.addLevel(mid, 20);
  lod.addLevel(low, 60);
  return lod;
}
// Distances are scene-scale dependent
```

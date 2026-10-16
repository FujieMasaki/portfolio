import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat } from "three";

/**
 * Water.js が水面の凹凸に使う法線マップを、その場で作る。
 * 公式サンプルの waternormals.jpg は npm の three に入っていないので、外部から取らずに生成する。
 *
 * 高さを、整数の波数を持つ sine の和で作るので、上下左右がそのままつながる（RepeatWrapping で敷き詰められる）。
 * 波の向きと波長を散らし、短い波ほど弱くして、穏やかな細波の模様にする。
 * 傾きは、全体の二乗平均が SLOPE になるようにそろえる（波の数を変えても荒さが変わらない）。
 */

const SIZE = 256;
const WAVES = 48;
/** 水面の傾きの二乗平均。小さいほど穏やか */
const SLOPE = 0.35;

/** 毎回同じ模様にするための、小さな疑似乱数（mulberry32） */
const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const createWaterNormals = () => {
  const random = createRandom(20261016);
  const waves = Array.from({ length: WAVES }, () => {
    const angle = random() * Math.PI * 2;
    const frequency = 2 + Math.floor(random() * 14);
    return {
      kx: Math.round(Math.cos(angle) * frequency),
      ky: Math.round(Math.sin(angle) * frequency),
      amplitude: frequency ** -1.5,
      phase: random() * Math.PI * 2,
    };
  });

  // 高さの傾き（x・y 方向の微分）を、波ごとに足し合わせる
  const slopes = new Float32Array(SIZE * SIZE * 2);
  let sumSquares = 0;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      let dx = 0;
      let dy = 0;
      for (const wave of waves) {
        const theta = ((wave.kx * x + wave.ky * y) / SIZE) * Math.PI * 2 + wave.phase;
        const slope = Math.cos(theta) * wave.amplitude * Math.PI * 2;
        dx += slope * wave.kx;
        dy += slope * wave.ky;
      }
      const index = (y * SIZE + x) * 2;
      slopes[index] = dx;
      slopes[index + 1] = dy;
      sumSquares += dx * dx + dy * dy;
    }
  }
  const scale = SLOPE / Math.sqrt(sumSquares / (SIZE * SIZE));

  // 接空間の法線（z が上）を、0〜255 の色にする
  const data = new Uint8Array(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    const nx = -slopes[i * 2] * scale;
    const ny = -slopes[i * 2 + 1] * scale;
    const length = Math.hypot(nx, ny, 1);
    data[i * 4] = Math.round(((nx / length) * 0.5 + 0.5) * 255);
    data[i * 4 + 1] = Math.round(((ny / length) * 0.5 + 0.5) * 255);
    data[i * 4 + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
    data[i * 4 + 3] = 255;
  }

  const texture = new DataTexture(data, SIZE, SIZE, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

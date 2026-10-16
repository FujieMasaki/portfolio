import { SRGBColorSpace, TextureLoader } from "three";

/** 写真なので、読み込んだ時点で sRGB の色として扱う（shader の最後の colorspace_fragment で sRGB に戻す） */
export class PhotoTextureLoader extends TextureLoader {
  load(...args: Parameters<TextureLoader["load"]>): ReturnType<TextureLoader["load"]> {
    const texture = super.load(...args);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
}

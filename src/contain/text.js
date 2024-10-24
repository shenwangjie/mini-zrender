import { DEFAULT_FONT, platformApi } from "../core/platform";
import LRU from '../core/LRU';

let textWidthCache = {};

export function getWidth(text, font) {
  font = font || DEFAULT_FONT;
  let cacheOfFont = textWidthCache[font];
  if (!cacheOfFont) {
    cacheOfFont = textWidthCache[font] = new LRU(500);
  }
  let width = cacheOfFont.get(text);
  if (width == null) { // undefined == null
    width = platformApi.measureText(text, font).width;
    cacheOfFont.put(text, width);
  }

  return width;
}

export function getLineHeight(font) {
  return getWidth('国', font);
}

export function adjustTextY(y, height, verticalAlign) {
  if (verticalAlign === 'middle') {
    y -= height / 2;
  } else if (verticalAlign === 'bottom') {
    y -= height;
  }
  return y;
}
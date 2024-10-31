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

export function calculateTextPosition(out, opts, rect) {
  const textPosition = opts.position || 'inside';
  const distance = opts.distance != null ? opts.distance : 5;

  const height = rect.height;
  const width = rect.width;
  const halfHeight = height / 2;

  let x = rect.x;
  let y = rect.y;

  let textAlign = 'left';
  let textVerticalAlign = 'top';

  if (textPosition instanceof Array) {

  } else {
    switch (textPosition) {
      case 'left':
        x -= distance;
        y += halfHeight;
        textAlign = 'right';
        textVerticalAlign = 'middle';
        break;
      case 'right':
        x += distance + width;
        y += halfHeight;
        textVerticalAlign = 'middle';
        break;
      case 'top':
        x += width / 2;
        y -= distance;
        textAlign = 'center';
        textVerticalAlign = 'bottom';
        break;
      case 'bottom':
        x += width / 2;
        y += height + distance;
        textAlign = 'center';
        break;
        case 'inside':
          x += width / 2;
          y += halfHeight;
          textAlign = 'center';
          textVerticalAlign = 'middle';
          break;
      case 'insideLeft':
          x += distance;
          y += halfHeight;
          textVerticalAlign = 'middle';
          break;
      case 'insideRight':
          x += width - distance;
          y += halfHeight;
          textAlign = 'right';
          textVerticalAlign = 'middle';
          break;
      case 'insideTop':
          x += width / 2;
          y += distance;
          textAlign = 'center';
          break;
      case 'insideBottom':
          x += width / 2;
          y += height - distance;
          textAlign = 'center';
          textVerticalAlign = 'bottom';
          break;
      case 'insideTopLeft':
          x += distance;
          y += distance;
          break;
      case 'insideTopRight':
          x += width - distance;
          y += distance;
          textAlign = 'right';
          break;
      case 'insideBottomLeft':
          x += distance;
          y += height - distance;
          textVerticalAlign = 'bottom';
          break;
      case 'insideBottomRight':
          x += width - distance;
          y += height - distance;
          textAlign = 'right';
          textVerticalAlign = 'bottom';
          break;
    }
  }

  out = out || {};
  out.x = x;
  out.y = y;
  out.align = textAlign;
  out.verticalAlign = textVerticalAlign;

  return out;
}
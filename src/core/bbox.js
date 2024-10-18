import * as vec2 from './vector';

const PI2 = Math.PI * 2;

export function fromArc(x, y, rx, ry, startAngle, endAngle, anticlockwise, min, max) {
  // const vec2Min = vec2.min;
  // const vec2Max = vec2.max;

  const diff = Math.abs(startAngle - endAngle);

  // 是一个圆
  if (diff % PI2 < 1e-4 && diff > 1e-4) {
    min[0] = x - rx;
    min[1] = y - ry;
    max[0] = x + rx;
    max[1] = y + ry;
    return;
  }

}
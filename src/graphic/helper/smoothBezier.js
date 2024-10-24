import { 
  clone as v2Clone,
  sub as v2Sub,
  scale as v2Scale,
  distance as v2Distance
 } from '../../core/vector'

export default function smoothBezier(
  points,
  smooth,
  isLoop,
  constraint
) {
  const cps = [];

  const v = [];
  const v1 = [];
  const v2 = [];
  let prevPoint;
  let nextPoint;

  let min;
  let max;
  for (let i = 0, len = points.length; i < len; i++) {
    const point = points[i];

    if (isLoop) {

    } else {
      if (i === 0 || i === len - 1) {
        cps.push(v2Clone(point));
        continue; // 直接走下次循环
      } else {
        prevPoint = points[i - 1];
        nextPoint = points[i + 1];
      }
    }

    v2Sub(v, nextPoint, prevPoint);

    v2Scale(v, v, smooth);

    let d0 = v2Distance(point, prevPoint);
    let d1 = v2Distance(point, nextPoint);
    const sum = d0 + d1;
    if (sum != 0) {
      d0 /= sum;
      d1 /= sum;
    }

    v2Scale(v1, v, -d0);
    v2Scale(v2, v, d1);
    const cp0 = v2Add([], point, v1);
    const cp1 = v2Add([], point, v2);
    
    cps.push(cp0);
    cps.push(cp1);
  }

  return cps;
}
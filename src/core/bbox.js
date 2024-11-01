import * as vec2 from "./vector";
import * as curve from "./curve";

const PI2 = Math.PI * 2;

const mathMin = Math.min;
const mathMax = Math.max;
const mathCos = Math.cos;
const mathSin = Math.sin;

const start = vec2.create();
const end = vec2.create();
const extremity = vec2.create();

export function fromLine(x0, y0, x1, y1, min, max) {
  min[0] = mathMin(x0, x1);
  min[1] = mathMin(y0, y1);
  max[0] = mathMax(x0, x1);
  max[1] = mathMax(y0, y1);
}

export function fromArc(
  x,
  y,
  rx,
  ry,
  startAngle,
  endAngle,
  anticlockwise,
  min,
  max
) {
  const vec2Min = vec2.min;
  const vec2Max = vec2.max;

  const diff = Math.abs(startAngle - endAngle);

  // 是一个圆
  if (diff % PI2 < 1e-4 && diff > 1e-4) {
    min[0] = x - rx;
    min[1] = y - ry;
    max[0] = x + rx;
    max[1] = y + ry;
    return;
  }

  start[0] = mathCos(startAngle) * rx + x;
  start[1] = mathSin(startAngle) * ry + y;
  end[0] = mathCos(endAngle) * rx + x;
  end[1] = mathSin(endAngle) * ry + y;

  vec2Min(min, start, end);
  vec2Max(max, start, end);

  // Thresh to [0, Math.PI * 2]
  startAngle = startAngle % PI2;
  if (startAngle < 0) {
    startAngle = startAngle + PI2;
  }
  endAngle = endAngle % PI2;
  if (endAngle < 0) {
    endAngle = endAngle + PI2;
  }

  if (startAngle > endAngle && !anticlockwise) {
    endAngle += PI2;
  } else if (startAngle < endAngle && anticlockwise) {
    startAngle += PI2;
  }
  if (anticlockwise) {
    const tmp = endAngle;
    endAngle = startAngle;
    startAngle = tmp;
  }

  // const number = 0;
  // const step = (anticlockwise ? -Math.PI : Math.PI) / 2;
  for (let angle = 0; angle < endAngle; angle += Math.PI / 2) {
    if (angle > startAngle) {
      extremity[0] = mathCos(angle) * rx + x;
      extremity[1] = mathSin(angle) * ry + y;

      vec2Min(min, extremity, min);
      vec2Max(max, extremity, max);
    }
  }
}

const xDim = [];
const yDim = [];
export function fromCubic(x0, y0, x1, y1, x2, y2, x3, y3, min, max) {
  const cubicExtrema = curve.cubicExtrema;
  const cubicAt = curve.cubicAt;
  let n = cubicExtrema(x0, x1, x2, x3, xDim);
  min[0] = Infinity;
  min[1] = Infinity;
  max[0] = -Infinity;
  max[1] = -Infinity;

  for (let i = 0; i < n; i++) {
    const x = cubicAt(x0, x1, x2, x3, xDim[i]);
    min[0] = mathMin(x, min[0]);
    max[0] = mathMax(x, max[0]);
  }
  n = cubicExtrema(y0, y1, y2, y3, yDim);
  for (let i = 0; i < n; i++) {
    const y = cubicAt(y0, y1, y2, y3, yDim[i]);
    min[1] = mathMin(y, min[1]);
    max[1] = mathMax(y, max[1]);
  }

  min[0] = mathMin(x0, min[0]);
  max[0] = mathMax(x0, max[0]);
  min[0] = mathMin(x3, min[0]);
  max[0] = mathMax(x3, max[0]);

  min[1] = mathMin(y0, min[1]);
  max[1] = mathMax(y0, max[1]);
  min[1] = mathMin(y3, min[1]);
  max[1] = mathMax(y3, max[1]);
}

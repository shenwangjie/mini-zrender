const EPSILON = 1e-8;

const mathSqrt = Math.sqrt;

function isAroundZero(val) {
  return val > -EPSILON && val < EPSILON;
}
function isNotAroundZero(val) {
  return val > EPSILON || val < -EPSILON;
}
/**
 * 计算三次贝塞尔值
 */
export function cubicAt(p0, p1, p2, p3, t) {
  const onet = 1 - t;
  return onet * onet * (onet * p0 + 3 * t * p1)
          + t * t * (t * p3 + 3 * onet * p2);
}

/**
 * 计算三次贝塞尔方程极限值的位置
 * @return 有效数目
 */
export function cubicExtrema(p0, p1, p2, p3, extrema) {
  const b = 6 * p2 - 12 * p1 + 6 * p0;
  const a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
  const c = 3 * p1 - 3 * p0;

  let n = 0;
  if (isAroundZero(a)) {
      if (isNotAroundZero(b)) {
          const t1 = -c / b;
          if (t1 >= 0 && t1 <= 1) {
              extrema[n++] = t1;
          }
      }
  }
  else {
      const disc = b * b - 4 * a * c;
      if (isAroundZero(disc)) {
          extrema[0] = -b / (2 * a);
      }
      else if (disc > 0) {
          const discSqrt = mathSqrt(disc);
          const t1 = (-b + discSqrt) / (2 * a);
          const t2 = (-b - discSqrt) / (2 * a);
          if (t1 >= 0 && t1 <= 1) {
              extrema[n++] = t1;
          }
          if (t2 >= 0 && t2 <= 1) {
              extrema[n++] = t2;
          }
      }
  }
  return n;
}
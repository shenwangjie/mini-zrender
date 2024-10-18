/**
 * 
 * 3x2矩阵操作类
 */
export function create() {
  return [1, 0, 0, 1, 0, 0];
}

// 旋转变换
export function rotation(out, a, rad, pivot) {
  const aa = a[0];
  const ac = a[2];
  const atx = a[4];
  const ab = a[1];
  const ad = a[3];
  const aty = a[5];
  const st = Math.sin(rad);
  const ct = Math.cos(rad);

  out[0] = aa * ct + ab * st;
  out[1] = -aa * st + ab * ct;
  out[2] = ac * ct + ad * st;
  out[3] = -ac * st + ct * ad;
  out[4] = ct * (atx - pivot[0]) + st * (aty - pivot[1]) + pivot[0];
  out[5] = ct * (aty - pivot[1]) - st * (atx - pivot[0]) + pivot[1];
  return out;
}

// 求逆矩阵
export function invert(out, a) {

  const aa = a[0];
  const ac = a[2];
  const atx = a[4];
  const ab = a[1];
  const ad = a[3];
  const aty = a[5];

  let det = aa * ad - ab * ac;
  if (!det) {
      return null;
  }
  det = 1.0 / det;

  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}
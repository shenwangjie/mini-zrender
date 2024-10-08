export function clone(v) {
  return [v[0], v[1]];
}

export function sub(out, v1, v2) {
  out[0] = v1[0] - v2[0];
  out[1] = v1[1] - v2[1];
  return out;
}

export function scale(out, v, s) {
  out[0] = v[0] * s;
  out[1] = v[1] * s;
  return out;
}

export function distance(v1, v2) {
  return Math.sqrt(
    (v1[0] - v2[0]) * (v1[0] - v2[0])
    + (v1[1] - v2[1]) * (v1[1] - v2[1])
  );
}

export function add(out, v1, v2) {
  out[0] = v1[0] + v2[0];
  out[1] = v1[1] + v2[1];
  return out;
}
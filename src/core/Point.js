
export default class Point {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  transform(m) {
    if (!m) {
      return;
    }

    const x = this.x;
    const y = this.y;
    this.x = m[0] * x + m[2] * y + m[4];
    this.y = m[1] * x + m[3] * y + m[5];
    return this;
  }
}
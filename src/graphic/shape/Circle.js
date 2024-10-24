/**
 * 圆形
 */

import Path from "../Path";

export class CircleShape {
  cx = 0
  cy = 0
  r = 0
}

class Circle extends Path {

  constructor(opts) {
    super(opts);
  }

  getDefaultShape() {
    return new CircleShape();
  }

  buildPath(ctx, shape) {
    ctx.moveTo(shape.cx + shape.r, shape.cy);
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
  }
};

Circle.prototype.type = 'circle';

export default Circle;
/**
 * 直线
 */
import Path from "../Path";

export class LineShape {
  x1 = 0
  y1 = 0

  x2 = 0
  y2 = 0

  percent = 1
}

class Line extends Path {
  constructor(opts) {
    super(opts);
  }

  getDefaultStyle() {
    return {
      stroke: '#000',
      fill: null
    }
  }

  getDefaultShape() {
    return new LineShape();
  }

  buildPath(ctx, shape) {
    let x1, y1;
    let x2, y2;

    x1 = shape.x1;
    y1 = shape.y1;
    x2 = shape.x2;
    y2 = shape.y2;

    const percent = shape.percent;

    if (percent === 0) {
      return;
    }

    ctx.moveTo(x1, y1);
    if (percent < 1) {
      x2 = x1 * (1 - percent) + x2 * percent;
      y2 = y1 * (1 - percent) + y2 * percent;
    }
    ctx.lineTo(x2, y2);
  }
}

Line.prototype.type = 'line';
export default Line;
/**
 * 矩形
 */

import Path from "../Path"
import * as roundRectHelper from '../helper/roundRect';

export class RectShape {
  x = 0
  y = 0
  width = 0
  height = 0

  // 左上、右上、右下、左下
  // r = 1 ->         r = [1, 1, 1, 1]
  // r = [1] ->       r = [1, 1, 1, 1]
  // r = [1, 2] ->    r = [1, 2, 1, 2]
  // r = [1, 2, 3] -> r = [1, 2, 3, 2]
  r
}

class Rect extends Path {
  constructor(opts) {
    super(opts);
  }

  getDefaultShape() {
    return new RectShape();
  }

  buildPath(ctx, shape) {
    let x = shape.x;
    let y = shape.y;
    let width = shape.width;
    let height = shape.height;

    if (!shape.r) {
      ctx.rect(x, y, width, height);
    } else {
      roundRectHelper.buildPath(ctx, shape);
    }
  }
}

Rect.prototype.type = 'rect';

export default Rect;
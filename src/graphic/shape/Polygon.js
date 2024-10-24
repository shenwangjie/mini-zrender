/**
 * 多边形
 */

import Path from "../Path"
import * as polyHelper from '../helper/poly';

export class PolygonShape {
  points = null
  smooth = 0
  smoothConstraint = null
}

class Polygon extends Path {
  constructor(opts) {
    super(opts);
  }

  getDefaultShape() {
    return new PolygonShape();
  }

  buildPath(ctx, shape) {
    polyHelper.buildPath(ctx, shape, true);
  }
}

Polygon.prototype.type = 'polygon';

export default Polygon;
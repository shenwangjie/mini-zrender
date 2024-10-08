/**
 * 折线
 */
import Path from "../Path";
import * as polyHelper from '../helper/poly'

export class PolylineShape {
  points = null 
  smooth = 0 // 折线图会变成平滑的贝塞尔曲线
}

class Polyline extends Path {
  constructor(opts) {
    super(opts)
  }

  buildPath(ctx, shape) {
    polyHelper.buildPath(ctx, shape, false);
  }

  getDefaultShape() {
    return new PolylineShape();
  }

  getDefaultStyle() {
    return {
      stroke: '#000',
      fill: null
    }
  }
}

export default Polyline;
/**
 * 扇形
 */

import Path from "../Path"
import * as roundSectorHelper from '../helper/roundSector';

export class SectorShape {
  cx = 0
  cy = 0
  r0 = 0
  r = 0
  startAngle = 0
  endAngle = Math.PI * 2
  clockwise = true

  // 5               => [5, 5, 5, 5]
  // [5]             => [5, 5, 0, 0]
  // [5, 10]         => [5, 5, 10, 10]
  // [5, 10, 15]     => [5, 10, 15, 15]
  // [5, 10, 15, 20] => [5, 10, 15, 20]
  cornerRadius = 0
}

class Sector extends Path {
  constructor(opts) {
    super(opts);
  }

  getDefaultShape() {
    return new SectorShape();
  }

  buildPath(ctx, shape) {
    roundSectorHelper.buildPath(ctx, shape);
  }
}

Sector.prototype.type = 'sector';
export default Sector;
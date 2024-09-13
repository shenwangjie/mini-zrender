import Path from '../Path';

export class BezierCurveShape {
  constructor(cpx2 = undefined, cpy2 = undefined) {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.cpx1 = 0;
    this.cpy1 = 0;
    this.cpx2 = cpx2;
    this.cpy2 = cpy2;
    
    this.percent = 1;
  }
}

class BezierCurve extends Path {
  constructor(opts = null) {
    super(opts)
  }

  getDefaultStyle() {
    return {
      stroke: '#000',
      fill: null
    }
  }

  getDefaultShape() {
    return new BezierCurveShape();
  }
}

export default BezierCurve;
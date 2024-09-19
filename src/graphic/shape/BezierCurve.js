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

  buildPath(path, shape) {
    let x1 = shape.x1;
    let y1 = shape.y1;
    let x2 = shape.x2;
    let y2 = shape.y2;
    let cpx1 = shape.cpx1;
    let cpx2 = shape.cpx2;
    let cpy1 = shape.cpy1;
    let cpy2 = shape.cpy2;
    let percent = shape.percent;
    if (percent === 0) {
      return;
    }

    path.moveTo(x1, y1);

    if (cpx2 == null || cpy2 == null) {

    } else {
      if (percent < 1) {

      }
      path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
    }
  }
  
}

export default BezierCurve;
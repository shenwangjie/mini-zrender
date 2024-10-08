const CMD = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}

const mathAbs = Math.abs;
const mathMin = Math.min;
const mathMax = Math.max;

export default class PathProxy {
  _len = 0

  // Unit x, Unit y 阻止绘制过短的线段
  // 不用private的话会显示undefine，就会出现问题
  // _ux
  // _uy

  _xi = 0
  _yi = 0

  constructor(notSaveData) {
    if (notSaveData) {
      this._saveData = false;
    }

    if (this._saveData) {
      this.data = [];
    }
  }

  setScale(sx, sy, segmentIgnoreThreshold) {
    segmentIgnoreThreshold = segmentIgnoreThreshold || 0;
  }

  setDPR(dpr) {
    this.dpr = dpr;
  }

  setContext(ctx) {
    this._ctx = ctx;
  }

  reset() {
    if (this._saveData) {
      this._len = 0;
    }

    this._version++;
  }

  _drawPendingPt() {

  }

  toStatic() {
    this._drawPendingPt();

    const data = this.data;
    if (data instanceof Array) {
      data.length = this._len;
    }
  }

  addData(cmd, a, b ,c, d, e, f, g, h) {
    let data = this.data;
    if (this._len + arguments.length > data.length) {
      this._expandData();
      data = this.data;
    }
    for (let i = 0; i < arguments.length; i ++) {
      data[this._len++] = arguments[i];
    }
  }

  _expandData() {

  }

  moveTo(x, y) {
    this.addData(CMD.M, x, y);
    this._ctx && this._ctx.moveTo(x, y);

    this._x0 = x;
    this._y0 = y;
    this._xi = x;
    this._yi = y;
    
    return this;
  }

  lineTo(x, y) {
    const dx = mathAbs(x - this._xi);
    const dy = mathAbs(y - this._yi);
    const exceedUnit = dx > this._ux || dy > this._uy;

    this.addData(CMD.L, x, y);

    if (this._ctx && exceedUnit) {
      this._ctx.lineTo(x, y);
    }
    if (exceedUnit) {
      this._xi = x;
      this._yi = y;
    } 

    return this;
  }

  bezierCurveTo(x1, y1, x2, y2, x3, y3) {
    this.addData(CMD.C, x1, y1, x2, y2, x3, y3);
    if (this._ctx) {
      this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    }
    this._xi = x3;
    this._yi = y3;
    return this;
  }

  rebuildPath(ctx, percent) {
    const data = this.data;
    const len = this._len;
    const ux = this._ux;
    const uy = this._uy;

    let x0, y0;
    let xi, yi;
    let x, y;
    lo: for (let i = 0; i < len;) {
      const cmd = data[i++];
      const isFirst = i === 1;

      if (isFirst) {
        xi = data[i];
        yi = data[i + 1];

        x0 = xi;
        y0 = yi;
      }

      switch(cmd) {
        case CMD.M: 
            x0 = xi = data[i++];
            y0 = yi = data[i++];
            ctx.moveTo(xi, yi);
            break;
        case CMD.L:
            x = data[i++];
            y = data[i++];
            const dx = mathAbs(x - xi);
            const dy = mathAbs(y - yi);
            if (dx > ux || dy > uy) {
              ctx.lineTo(x, y);
              xi = x;
              yi = y;
            }
            break;
      }
    }
  }

  static initDefaultProps = (function () {
    const proto = PathProxy.prototype;
    proto._saveData = true;
    proto._ux = 0;
    proto._uy = 0;
    proto._version = 0;
  })()
}
const CMD = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}

export default class PathProxy {
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

  bezierCurveTo(x1, y1, x2, y2, x3, y3) {
    this.addData(CMD.C, x1, y1, x2, y2, x3, y3);
    if (this._ctx) {
      this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    }
    this._xi = x3;
    this._yi = y3;
    return this;
  }

  static initDefaultProps = (function () {
    const proto = PathProxy.prototype;
    proto._saveData = true;
  })()
}
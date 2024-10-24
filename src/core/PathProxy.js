import { fromArc } from './bbox';
import BoundingRect from './BoundingRect';
import * as vec2 from './vector';
import {devicePixelRatio as dpr} from '../config';

const hasTypedArray = typeof Float32Array !== 'undefined';

const CMD = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}

const min = [];
const max = [];
const min2 = [];
const max2 = [];

const mathAbs = Math.abs;
const mathMin = Math.min;
const mathMax = Math.max;
const mathCos = Math.cos;
const mathSin = Math.sin;

const tmpAngles = [];

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
    if (segmentIgnoreThreshold > 0) {
      this._ux = mathAbs(segmentIgnoreThreshold / dpr / sx) || 0;
      this._uy = mathAbs(segmentIgnoreThreshold / dpr / sy) || 0;
    }
  }

  setDPR(dpr) {
    this.dpr = dpr;
  }

  setContext(ctx) {
    this._ctx = ctx;
  }

  getContext() {
    return this._ctx;
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

  arc(cx, cy, r, startAngle, endAngle, anticlockwise) {
    this._drawPendingPt();

    tmpAngles[0] = startAngle;
    tmpAngles[1] = endAngle;

    startAngle = tmpAngles[0];
    endAngle = tmpAngles[1];

    let delta = endAngle - startAngle;

    this.addData(
      CMD.A, cx, cy, r, r, startAngle, delta, 0, anticlockwise ? 0 : 1
    );

    this._ctx && this._ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);

    this._xi = mathCos(endAngle) * r + cx;
    this._yi = mathSin(endAngle) * r + cy;
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

  closePath() {
    // Add pending point for previous path.
    this._drawPendingPt();

    this.addData(CMD.Z);

    const ctx = this._ctx;
    const x0 = this._x0;
    const y0 = this._y0;
    if (ctx) {
        ctx.closePath();
    }

    this._xi = x0;
    this._yi = y0;
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
        case CMD.A:
            const cx = data[i++];
            const cy = data[i++];
            const rx = data[i++];
            const ry = data[i++];
            let startAngle = data[i++];
            let delta = data[i++];
            const psi = data[i++];
            const anticlockwise = !data[i++];
            const r = rx > ry ? rx : ry;
            const isEllipse = mathAbs(rx - ry) > 1e-3;
            let endAngle = startAngle + delta;
            let breakBuild = false;

            if (isEllipse && ctx.ellipse) {
              ctx.ellipse(cx, cy, rx, ry, psi, startAngle, endAngle, anticlockwise);
            } else {
              ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
            }

            xi = mathCos(endAngle) * rx + cx;
            yi = mathSin(endAngle) * ry + cy;
            break;
      }
    }
  }

  beginPath() {
    this._ctx && this._ctx.beginPath();
    this.reset();
    return this;
  }

  len() {
    return this._len;
  }

  appendPath(path) {
    if (!path instanceof Array) {
      path = [path];
    }
    const len = path.length;
    let appendSize = 0;
    let offset = this._len;
    for (let i = 0; i < len; i++) {
      appendSize += path[i].len();
    }
    if (hasTypedArray && (this.data instanceof Float32Array)) {

    }
    for (let i = 0; i < len; i++) {
      const appendPathData = path[i].data;
      for (let k = 0; k < appendPathData.length; k++) {
        this.data[offset++] = appendPathData[k];
      }
    }
    this._len = offset;
    // _len和data的处理
  }

  setData(data) {
    const len = data.length;

    if (!(this.data && this.data.length === len) && hasTypedArray) {
        this.data = new Float32Array(len);
    }

    for (let i = 0; i < len; i++) {
        this.data[i] = data[i];
    }

    this._len = len;
  }

  getBoundingRect() {
    min[0] = min[1] = min2[0] = min2[1] = Number.MAX_VALUE;
    max[0] = max[1] = max2[0] = max2[1] = -Number.MAX_VALUE;

    const data = this.data;
    let xi = 0; let yi = 0;
    let x0 = 0; let y0 = 0;
    
    let i;
    for (i = 0; i < this._len;) {
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
          xi = x0 = data[i++];
          yi = y0 = data[i++];
          min2[0] = x0;
          min2[i] = y0;
          max2[0] = x0;
          max2[1] = y0;
          break;
        case CMD.A: 
          const cx = data[i++];
          const cy = data[i++];
          const rx = data[i++];
          const ry = data[i++];
          const startAngle = data[i++];
          const endAngle = data[i++] + startAngle;

          // arc 旋转
          i += 1;
          const anticlockwise = !data[i++];

          fromArc(
            cx, cy, rx, ry, startAngle, endAngle, anticlockwise, min2, max2
          );

          xi = mathCos(endAngle) * rx + cx;
          yi = mathSin(endAngle) * ry + cy;
          break;
      }

      vec2.min(min, min, min2);
      vec2.max(max, max, max2);
    }

    return new BoundingRect(
      min[0], min[1], max[0] - min[0], max[1] - min[1]
    );
  }

  static initDefaultProps = (function () {
    const proto = PathProxy.prototype;
    proto._saveData = true;
    proto._ux = 0;
    proto._uy = 0;
    proto._version = 0;
  })()
}
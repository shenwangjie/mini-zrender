import * as matrix from './matrix'

const EPSILON = 5e-5;
function isNotAroundZero(val) {
  return val > EPSILON || val < -EPSILON;
}
class Transformable {

  getLocalTransform(m) {
    return Transformable.getLocalTransform(this, m);
  }
  
  // 更新全局的transform（position等等）
  updateTransform() {
    const parentTransform = this.parent && this.parent.transform;
    const needLocalTransform = this.needLocalTransform();

    let m = this.transform;
    if (!(needLocalTransform || parentTransform)) {
      if (m) {
        matrix.identity();
        this.invTransform = null;
      }
      return;
    }

    m = m || matrix.create();

    if (needLocalTransform) {
      this.getLocalTransform(m)
    } else {
      matrix.identity();
    }

    if (parentTransform) {
      if (needLocalTransform) {

      } else {
        matrix.copy(m, parentTransform);
      }
    }

    // 保存矩阵变换
    this.transform = m;

    this._resolveGlobalScaleRatio(m);
    return;
  }

  _resolveGlobalScaleRatio(m) {
    const globalScaleRatio = this.globalScaleRatio;

    // 逆变换
    this.invTransform = this.invTransform || matrix.create();
    matrix.invert(this.invTransform, m);
  }

  static getLocalTransform(target, m) {
    m = m || [];
    const ox = target.originX || 0;
    const oy = target.originY || 0;
    const sx = target.scaleX;
    const sy = target.scaleY;
    const ax = target.anchorX;
    const ay = target.anchorY;
    const rotation = target.rotation || 0;
    const x = target.x;
    const y = target.y;
    const skewX = target.skewX ? Math.tan(target.skewX) : 0;
    const skewY = target.skewY ? Math.tan(-target.skewY) : 0;

    if (ox || oy || ax || ay) {
      const dx = ox + ax;
      const dy = oy + ay;
      m[4] = -dx * sx - skewX * dy * sy;
      m[5] = -dy * sy - skewY * dx * sx;
    } else {
      m[4] = m[5] = 0;
    }
    // scale
    m[0] = sx;
    m[3] = sy;
    // skew
    m[1] = skewY * sx;
    m[2] = skewX * sy;
    // rotation
    rotation && matrix.rotation(m, m, rotation);

    m[4] += ox + x;
    m[5] += oy + y;
    return m;
  }

  getGlobalScale(out) {
    const m = this.transform;
    out = out || [];
    if (!m) {
      out[0] = 1;
      out[1] = 1;
      return out;
    }
    // 缩放和倾斜的平方根
    out[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    out[1] = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
    if (m[0] < 0) {
      out[0] = -out[0];
    }
    if (m[3] < 0) {
      out[1] = -out[1];
    }
    return out;
  }

  // 是否需要计算transform
  needLocalTransform() {
    return isNotAroundZero(this.rotation)
        || isNotAroundZero(this.x)
        || isNotAroundZero(this.y)
        || isNotAroundZero(this.scaleX - 1)
        || isNotAroundZero(this.scaleY - 1)
        || isNotAroundZero(this.skewX)
        || isNotAroundZero(this.skewY);
  }

  static initDefaultProps = (function () {
    const proto = Transformable.prototype;
    proto.scaleX =
    proto.scaleY =
    proto.globalScaleRatio = 1;
    proto.x =
    proto.y =
    proto.originX =
    proto.originY =
    proto.skewX =
    proto.skewY =
    proto.rotation =
    proto.anchorX =
    proto.anchorY = 0;
  })()
}

export default Transformable;
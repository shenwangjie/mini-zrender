import Displayable, { DEFAULT_COMMON_STYLE } from './Displayable';
import { keys, createObject, defaults, extend, clone } from '../core/util'
import { SHAPE_CHANGED_BIT, STYLE_CHANGED_BIT, REDRAW_BIT } from './constants';
import PathProxy from '../core/PathProxy';

export const DEFAULT_PATH_STYLE = defaults({
  fill: '#000',
  stroke: null,
  strokePercent: 1,
  fillOpacity: 1,
  strokeOpacity: 1,

  lineDashOffset: 0,
  lineWidth: 1,
  lineCap: 'butt',
  miterLimit: 10,
  
  strokeNoScale: false,
  strokeFirst: false
}, DEFAULT_COMMON_STYLE)

class Path extends Displayable {
  // 目前来看在constructor中不使用就不要定义它，不然外部拿到对象的属性就是undefined
  // style
  // shape

  constructor(opts = null) {
    super(opts);
  }

  _init(props = null) {
    const keysArr = keys(props);

    this.shape = this.getDefaultShape();
    const defaultStyle = this.getDefaultStyle();
    if (defaultStyle) {
      this.useStyle(defaultStyle);
    }

    for (let i = 0; i < keysArr.length; i++) {
      const key = keysArr[i];
      const value = props[key];
      if (key === 'style') {
        if (!this.style) {
          this.useStyle(value);
        } else {
          extend(this.style, value);
        }
      } else if (key === 'shape') {
        extend(this.shape, value);
      } else {
        super.attrKV(key, value);
      }
    }

    if (!this.style) {
      this.useStyle({})
    }
  }
  // 需要重写
  getDefaultShape() {
    return {};
  }

  getDefaultStyle() {
    return null;
  }

  pathUpdated() {
    this.__dirty &= ~SHAPE_CHANGED_BIT;
    // this.__dirty = this.__dirty & (~SHAPE_CHANGED_BIT);  // 0111 & 1011 = 3
  }

  createPathProxy() {
    this.path = new PathProxy(false);
  }

  hasStroke() {
    const style = this.style;
    const stroke = style.stroke;
    return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0))
  }

  createStyle(obj = null) {
    return createObject(DEFAULT_PATH_STYLE, obj)
  }

  update() {
    super.update();
  }

  updateDuringAnimation(targetKey) {
    if (targetKey === 'style') {
        this.dirtyStyle();
    }
    else if (targetKey === 'shape') {
        this.dirtyShape();
    }
    else {
        this.markRedraw();
    }
  }

  getUpdatedPathProxy(inBatch) {
    !this.path && this.createPathProxy();
    this.path.beginPath();
    this.buildPath(this.path, this.shape, inBatch);
    return this.path;
  }

  getBoundingRect() {
    let rect = this._rect;
    const style = this.style;
    const needsUpdateRect = !rect;
    if (needsUpdateRect) {
      let firstInvoke = false;
      if (!this.path) {
        firstInvoke = true;
        this.createPathProxy();
      }
      let path = this.path;
      if (firstInvoke || (this.__dirty & SHAPE_CHANGED_BIT)) {
        path.beginPath();
        this.buildPath(path, this.shape, false);
        this.pathUpdated();
      }
      rect = path.getBoundingRect();
    }

    this._rect = rect;

    return rect;
  }

  // 自己定义一个形状，如星星
  static extend(defaultProps) {
    class Sub extends Path {
      getDefaultStyle() {
        return clone(defaultProps.style);
      }

      getDefaultShape() {
        return clone(defaultProps.shape);
      }

      constructor(opts) {
        super(opts);
        defaultProps.init && defaultProps.init.call(this, opts);
      }
    }

    for (let key in defaultProps) {
      if (typeof defaultProps[key] === 'function') {
        Sub.prototype[key] = defaultProps[key];
      }
    }

    return Sub;
  }

  static initDefaultProps = (function () {
    const pathProto = Path.prototype;
    pathProto.type = 'path';
    pathProto.strokeContainThreshold = 5;
    pathProto.segmentIgnoreThreshold = 0;
    pathProto.subPixelOptimize = false;
    pathProto.autoBatch = false; // 元素能被自动批量处理
    pathProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT | SHAPE_CHANGED_BIT;
  })()  
}

export default Path
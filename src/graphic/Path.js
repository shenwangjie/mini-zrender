import Displayable, { DEFAULT_COMMON_STYLE } from './Displayable';
import { keys, createObject, defaults, extend } from '../core/util'
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

  static initDefaultProps = (function () {
    const pathProto = Path.prototype;
    pathProto.type = 'path';
    pathProto.strokeContainThreshold = 5;
    pathProto.segmentIgnoreThreshold = 0;
    pathProto.subPixelOptimize = false;
    pathProto.autoBatch = false;
    pathProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT | SHAPE_CHANGED_BIT;
  })()  
}

export default Path
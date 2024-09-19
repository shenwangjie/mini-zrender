import Displayable, { DEFAULT_COMMON_STYLE } from './Displayable';
import { keys, createObject, defaults, extend } from '../core/util'
import { SHAPE_CHANGED_BIT } from './constants';
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

  pathUpdated() {
    this._dirty &= ~SHAPE_CHANGED_BIT;
    // this._dirty = this._dirty & (~SHAPE_CHANGED_BIT);
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
}

export default Path
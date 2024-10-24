import Element from '../Element'
import { REDRAW_BIT, SHAPE_CHANGED_BIT, STYLE_CHANGED_BIT } from './constants'

const STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));

export const DEFAULT_COMMON_STYLE = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: '#000',
  opacity: 1,
  blend: 'source-over'
}

DEFAULT_COMMON_STYLE[STYLE_MAGIC_KEY] = true;
class Displayable extends Element {

  constructor(props = null) {
    super(props);
  }

  _init(props = null) {

  }

  beforeBrush() {}
  afterBrush() {}

  innerBeforeBrush() {}
  innerAfterBrush() {}

  styleChanged() {
    return !!(this.__dirty && SHAPE_CHANGED_BIT);
  }

  useStyle(obj) {
    if (!obj[STYLE_MAGIC_KEY]) {
      obj = this.createStyle(obj)
    }

    this.style = obj;

    this.dirtyStyle();
  }

  dirtyStyle(notRedraw = undefined) {
    if (!notRedraw) {
      this.markRedraw();
    }

    this.__dirty |= STYLE_CHANGED_BIT;

    if (this._rect) {
      this._rect = null;
    }
  }

  attrKV(key, value) {
    super.attrKV(key, value);
  }

  styleUpdated() {
    this.__dirty &= ~STYLE_CHANGED_BIT;
  }

  static initDefaultProps = (function () {
    const dispProto = Displayable.prototype;
    dispProto.zlevel = 0;

    dispProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT;
  })()
}

export default Displayable;
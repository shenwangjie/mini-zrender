import Element from '../Element'
import { STYLE_CHANGED_BIT } from './constants'

const STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));

export const DEFAULT_COMMON_STYLE = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: '#000',
  opacity: 1,
  blend: 'source-over'
}

class Displayable extends Element {
  constructor(props = null) {
    super(props);
  }

  _init(props = null) {

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
}

export default Displayable;
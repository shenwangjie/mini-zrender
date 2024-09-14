import { REDRAW_BIT } from './graphic/constants'
import Transformable from './core/Transformable'
import { mixin } from './core/util'
class Element {
  constructor(props = null) {
    this._init(props)
  }

  attrKV(key, value) {
    if (key === 'textConfig') {

    } else if (key === 'textContent') {

    } else if (key === 'clipPath') {
      
    } else if (key === 'extra') {
      
    } else {
      this[key] = value;
    }
  }

  beforeUpdate() {}

  update() {
    this.updateTransform();

    if (this.__dirty) {
      this.updateInnerText();
    }
  }

  updateInnerText(forceUpdate = undefined) {

  }

  markRedraw() {
    this.__dirty |= REDRAW_BIT; // 按位或 如3|5 = 7 0011 | 0101 = 0111
    const zr = this.__zr;
    if (zr) {
      console.info('next...')
    }
  }

  getClipPath() {
    return this._clipPath;
  }

  static initDefaultProps = (function () {
    const elProto = Element.prototype;
    elProto.type = 'element';
    elProto.name = '';

    function createLegacyProperty(key, privateKey, xKey, yKey) {
      // 设置position scale origin 三个属性会走里面的set方法
      Object.defineProperty(elProto, key, {
        get() {
          if (!this[privateKey]) {
            const pos = this[privateKey] = [];
            enhanceArray(this, pos);
          }
          return this[privateKey];
        },
        set(pos) {
          this[xKey] = pos[0];
          this[yKey] = pos[1];
          this[privateKey] = pos;
          enhanceArray(this, pos);
        }
      });
      function enhanceArray(self, pos) {
        Object.defineProperty(pos, 0, {
          get() {
            return self[xKey];
          },
          set(val) {
            self[xKey] = val;
          }
        });
        Object.defineProperty(pos, 1, {
          get() {
            return self[yKey];
          },
          set(val) {
            self[yKey] = val;
          }
        })
      }
    }
    if (Object.defineProperty) { // 只是不支持ie8
      createLegacyProperty('position', '_legacyPos', 'x', 'y');
      createLegacyProperty('scale', '_legacyScale', 'scaleX', 'scaleY');
      createLegacyProperty('orgin', '_legacyOrigin', 'originX', 'originY');
    }
  })()
}

mixin(Element, Transformable);

export default Element;
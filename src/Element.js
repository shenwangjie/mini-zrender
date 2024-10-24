import { REDRAW_BIT } from './graphic/constants'
import Transformable from './core/Transformable'
import { mixin, isObject, keys, guid } from './core/util'
import Animator from './animation/Animator'
import Eventful from './core/Eventful'
class Element {
  id = guid()

  animators = []

  // parent

  constructor(props = null) {
    this._init(props)
  }

  _init(props) {
    // Init default properties
    this.attr(props);
  }

  attr(keyOrObj, value) {
    if (typeof keyOrObj === 'string') {
      this.attrKV(keyOrObj, value)
    } else if (isObject(keyOrObj)) {
      let obj = keyOrObj;
      let keysArr = keys(obj);
      for (let i = 0; i < keysArr.length; i++) {
        let key = keysArr[i];
        this.attrKV(key, keyOrObj[key]);
      }
    }
    this.markRedraw();
    return this;
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
  afterUpdate() {}

  update() {
    this.updateTransform();

    if (this.__dirty) {
      this.updateInnerText();
    }
  }

  updateInnerText(forceUpdate = undefined) {

  }
  // 标记重绘
  markRedraw() {
    this.__dirty |= REDRAW_BIT; // 按位或 如3|5 = 7 0011 | 0101 = 0111
    const zr = this.__zr;
    if (zr) {
      zr.refresh();
    }
  }

  getClipPath() {
    return this._clipPath;
  }

  addSelfToZr(zr) {
    this.__zr = zr;
  }

  animate(key, loop) {
    let target = key ? this[key] : this;

    const animator = new Animator(target, loop);
    key && (animator.targetName = key);
    this.addAnimator(animator, key);
    return animator;
  }

  addAnimator(animator, key) {
    const zr = this.__zr;
    const el = this;

    animator.during(function () {
      el.updateDuringAnimation(key);
    }).done(function () {

    })

    this.animators.push(animator);

    if (zr) {
      zr.animation.addAnimator(animator);
    }
    // 唤醒zrender去循环动画
    zr && zr.wakeUp();
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

mixin(Element, Eventful);
mixin(Element, Transformable);

export default Element;
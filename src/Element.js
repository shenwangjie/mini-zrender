import { REDRAW_BIT } from './graphic/constants'
import Transformable from './core/Transformable'
import { mixin, isObject, keys, guid, extend } from './core/util'
import Animator from './animation/Animator'
import Eventful from './core/Eventful'
import BoundingRect from './core/BoundingRect'
import { calculateTextPosition } from './contain/text'

let tmpBoundingRect = new BoundingRect(0, 0, 0, 0);
let tmpTextPosCalcRes = {};

class Element {
  id = guid()

  animators = []

  _textContent

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
      this.setTextConfig(value);
    } else if (key === 'textContent') {
      this.setTextContext(value);
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
  // update text content
  updateInnerText(forceUpdate = undefined) {
    const textEl = this._textContent;
    if (textEl && (!textEl.ignore || forceUpdate)) {
      if (!this.textConfig) {
        this.textConfig = {};
      }
      const textConfig = this.textConfig;
      const isLocal = textConfig.local;
      const innerTransformable = textEl.innerTransformable;

      let textAlign;
      let textVerticalAlign;

      let textStyleChanged = false;
      
      innerTransformable.copyTransform(textEl);

      if (textConfig.position != null) {
        let layoutRect = tmpBoundingRect;
        if (textConfig.layoutRect) {

        } else {
          layoutRect.copy(this.getBoundingRect());
        }

        if (!isLocal) {
          layoutRect.applyTransform(this.transform);
        }

        if (this.calculateTextPosition) {

        } else {
          calculateTextPosition(tmpTextPosCalcRes, textConfig, layoutRect);
        }

        innerTransformable.x = tmpTextPosCalcRes.x;
        innerTransformable.y = tmpTextPosCalcRes.y;

        textAlign = tmpTextPosCalcRes.align;
        textVerticalAlign = tmpTextPosCalcRes.verticalAlign;
        
      }

      const isInside = textConfig.inside == null
          ? (typeof textConfig.position === 'string' && textConfig.position.indexOf('inside') >= 0)
          : textConfig.inside;
      const innerTextDefaultStyle = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {});

      let textFill;
      let textStroke;
      let autoStroke;
      if (isInside) {
        textFill = textConfig.insideFill;
        textStroke = textConfig.insideStroke;

        if (textFill == null || textFill === 'auto') {
          textFill = '#fff';
        }
        if (textStroke == null || textStroke === 'auto') {
          textStroke = '#000';
          autoStroke = true;
        }
      }
      textFill = textFill || '#000';

      if (textFill !== innerTextDefaultStyle.fill
        || textStroke !== innerTextDefaultStyle.stroke
        || autoStroke !== innerTextDefaultStyle.autoStroke
        || textAlign !== innerTextDefaultStyle.align
        || textVerticalAlign !== innerTextDefaultStyle.verticalAlign
      ) {

        textStyleChanged = true;

        innerTextDefaultStyle.fill = textFill;
        innerTextDefaultStyle.stroke = textStroke;
        innerTextDefaultStyle.autoStroke = autoStroke;
        innerTextDefaultStyle.align = textAlign;
        innerTextDefaultStyle.verticalAlign = textVerticalAlign;

        textEl.setDefaultTextStyle(innerTextDefaultStyle);
      }

      textEl.__dirty != REDRAW_BIT;

      if (textStyleChanged) {
        textEl.dirtyStyle(true);
      }
    }
  }

  getBoundingRect() {
    return null;
  }

  setTextConfig(cfg) {
    if (!this.textConfig) {
      this.textConfig = {};
    }
    extend(this.textConfig, cfg);
    this.markRedraw();
  }

  // 设置属性textContent
  setTextContext(zrT) {
    const previousTextContent = this._textContent;
    if (previousTextContent === zrT) {
      return;
    }

    if (previousTextContent && previousTextContent !== zrT) {

    }

    zrT.innerTransformable = new Transformable();
    this._attachComponent(zrT);
    this._textContent = zrT;
    this.markRedraw();
  }
  // 获取有关联的text content
  getTextContent() {
    return this._textContent;
  }

  // 标记重绘
  markRedraw() {
    this.__dirty |= REDRAW_BIT; // 按位或 如3|5 = 7 0011 | 0101 = 0111
    const zr = this.__zr;
    if (zr) {
      zr.refresh();
    }
  }

  _attachComponent(componentEl) {
    const zr = this.__zr;
    if (zr) {

    }
    componentEl.__zr = zr;
    // componentEl.__hostTarget = this;
  }

  getClipPath() {
    return this._clipPath;
  }

  addSelfToZr(zr) {
    this.__zr = zr;

    if (this._textContent) {
      this._textContent.addSelfToZr(zr);
    }
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
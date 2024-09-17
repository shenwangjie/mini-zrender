
import * as zrUtil from './core/util' // 全部导出并设定对象zrUtil
import env from './core/env';
import HandlerProxy from './dom/HandlerProxy'
import Handler from './Handler'
import Animation, { getTime } from './animation/Animation';
import Storage from './Storage'

const painterCtors = {};
let instances = {};

class ZRender {

  constructor(id, dom = null, opts = null) {
    this.id = id;
    this.dom = dom;

    this._needsRefresh = true
    this._needsRefreshHover = true

    opts = opts || {};

    const storage = new Storage(); // 创建存储实例

    let rendererType = opts.renderer || 'canvas' // 渲染器种类

    const painter = new painterCtors[rendererType](dom, storage, opts, id) // 创建painter实例

    this.storage = storage
    this.painter = painter

    const handlerProxy = (!env.node && !env.worker) ? new HandlerProxy(painter.getViewportRoot(), painter.root): null
    let pointerSize;

    this.handler = new Handler(storage, painter, handlerProxy, painter.root, pointerSize);

    this.animation = new Animation({
      stage: {
        update: () => this._flush(true)
      }
    })

    this.animation.start();
  }

  refreshImmediately(fromInside = undefined) {
    // Clear needsRefresh ahead to avoid something wrong happens in refresh
    // Or it will cause zrender refreshes again and again.
    this._needsRefresh = false;
    this.painter.refresh();
    // Avoid trigger zr.refresh in Element#beforeUpdate hook
    this._needsRefresh = false;
    console.error('不知道为啥再写一遍');
  }
  refreshHoverImmediately() {
    this._needsRefreshHover = false;
    if (this.painter.refreshHover && this.painter.getType() === 'canvas') {
      this.painter.refreshHover();
    }
  }
  _flush(fromInside = undefined) {
    let triggerRendered;

    const start = getTime();
    if (this._needsRefresh) {
      triggerRendered = true;
      this.refreshImmediately(fromInside);
    }

    if (this._needsRefreshHover) {
      triggerRendered = true;
      this.refreshHoverImmediately();
    }

    const end = getTime();
    if (triggerRendered) {
      this._stillFrameAccum = 0;
      this.trigger('rendered', {
        elapsedTime: end - start
      })
    }
  }

  trigger(eventName, event = null) {
    this.handler.trigger(eventName, event);
  }
}

/**
 * 初始化一个 zrender 的实例
 * 入口方法
 */
export function init(dom = null, opts = null) {
  const zr = new ZRender(zrUtil.guid(), dom, opts);
  instances[zr.id] = zr;
  return zr;
}

export function registerPainter(name, Ctor) {
  painterCtors[name] = Ctor
}
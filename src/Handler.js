import Eventful from './core/Eventful'
import * as util from './core/util'

const handlerNames = [
  'click', 'dbclick', 'mousewheel', 'mouseout',
  'mouseup', 'mousedown', 'mousemove', 'contextmenu'
]

function makeEventPacket(eventName, targetInfo, event) {
  return {
    type: eventName,
    event: event,
    target: targetInfo.target,
    topTarget: targetInfo.topTarget,
    cancelBubble: false,
    offsetX: event.zrX,
    offsetY: event.zrY,
    gestureEvent: event.gestureEvent,
    pinchX: event.pinchX,
    pinchY: event.pinchY,
    pinchScale: event.pinchScale,
    wheelDelta: event.zrDelta
  }
}
class HoveredResult {
  x
  y
  target
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class EmptyProxy extends Eventful {
  handler = null
}
class Handler extends Eventful {
  constructor(
    storage,
    painter,
    proxy,
    painterRoot,
    pointerSize
  ) {
    super();
    this.storage = storage;
    this.painter = painter;
    this.painterRoot = painterRoot;
    this._pointerSize = pointerSize;
    proxy = proxy || new EmptyProxy()
    /**
    * Proxy of event. can be Dom, WebGLSurface, etc.
    */
    this.proxy = null;
    console.error('不是很理解');

    this.setHandlerProxy(proxy);

    // this._draggingMgr = new Draggable(this);
  }

  setHandlerProxy(proxy) {
    if (proxy) {
      util.each(handlerNames, function(name) {
        proxy.on && proxy.on(name, this[name], this);
      }, this);
      proxy.handler = this;
    }
    this.proxy = proxy;
  }

  mousemove(event) {

  }

  mouseout(event) {

  }

  findHover(x, y, exclude) {
    const list = this.storage.getDisplayList();
    const out = new HoveredResult(x, y);
    setHoverTarget(list, out, x, y, exclude);

    return out;
  }

  // 事件分发代理
  dispatchToElement(targetInfo, eventName, event) {
    targetInfo = targetInfo || {};

    let el = targetInfo.target;

    const eventKey = ('on' + eventName);
    const eventPacket = makeEventPacket(eventName, targetInfo, event);

    while(el) {
      el[eventKey] && (eventPacket.cancelBubble = !!el[eventKey].call(el, eventPacket));

      el.trigger(eventName, eventPacket);

      el = el.__hostTarget ? el.__hostTarget : el.parent;

      if (eventPacket.cancelBubble) {
        break;
      }
    }

    if (!eventPacket.cancelBubble) {
      this.trigger(eventName, eventPacket);
    }
  }
}

util.each(['click', 'mousedown', 'mouseup', 'mousewheel', 'dbclick', 'contextmenu'], function(name) {
  Handler.prototype[name] = function (event) { // trigger回调
    const x = event.zrX;
    const y = event.zrY;
    const isOutside = isOutsideBoundary(this, x, y);

    let hovered;
    let hoveredTarget;

    if (name !== 'mouseup' || !isOutside) {
      hovered = this.findHover(x, y);
      hoveredTarget = hovered.target;
    }
    this.dispatchToElement(hovered, name, event);
  }
})

function isHover(displayable, x, y) {

}

function setHoverTarget(list, out, x, y, exclude) {
  for (let i = list.length - 1; i >= 0; i--) {
    const el = list[i];
    let hoverCheckResult;
    if (el !== exclude && !el.ignore) {
      !out.topTarget && (out.topTarget = el);
      out.target = el;
      break;
    }
  }
}

function isOutsideBoundary(handlerInstance, x, y) {
  const painter = handlerInstance.painter;
  return x < 0 || x > painter.getWidth() || y < 0 || y > painter.getHeight();
}

export default Handler
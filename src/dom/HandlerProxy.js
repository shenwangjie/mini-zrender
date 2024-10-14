
import env from '../core/env';
import Eventful from '../core/Eventful'
import * as zrUtil from '../core/util'
import { getNativeEvent, normalizeEvent } from '../core/event'

const localNativeListenerNames = (function() {
  const mouseHandlerNames = [
    'click', 'dblclick', 'mousewheel', 'wheel', 'mouseout',
    'mouseup', 'mousedown', 'mousemove', 'contextmenu'
  ];
  const touchHandlerNames = [
    'touchstart', 'touchend', 'touchmove'
  ];
  const pointerEventNameMap = {
    pointerdown: 1, pointerup: 1, pointermove: 1, pointerout: 1
  };
  const pointerHandlerNames = zrUtil.map(mouseHandlerNames, function(name) {
    const nm = name.replace('mouse', 'pointer');
    return pointerEventNameMap.hasOwnProperty(nm) ? nm : name;
  });

  return {
    mouse: mouseHandlerNames,
    touch: touchHandlerNames,
    pointer: pointerHandlerNames
  }
})();

const localDOMHandlers = {
  mousedown(event) {
    event = normalizeEvent(this.dom, event);

    this.__mayPointerCapture = [event.zrX, event.zrY];

    this.trigger('mousedown', event);
  },

  mousemove(event) {
    event = normalizeEvent(this.dom, event);

    const downPoint = this.__mayPointerCapture;

    this.trigger('mousemove', event);
  },

  mouseup(event) {

  },

  mouseout(event) {

  },

  wheel(event) {

  },

  mousewheel(event) {

  },

  touchstart(event) {

  },

  touchmove(event) {

  },

  touchend(event) {

  },

  pointerdown(event) {

  },

  pointermove(event) {

  },

  pointerup(event) {

  },

  pointerout(event) {

  },
}

zrUtil.each(['click', 'dbclick', 'contextmenu'], function(name) {
  localDOMHandlers[name] = function(event) {
    event = normalizeEvent(this.dom, event);
    this.trigger(name, event);
  }
})

const globalDOMHandlers = {

}

function mountLocalDOMEventListeners(instance, scope) {
  const domHandlers = scope.domHandlers;

  if (env.pointerEventSupported) { // Only IE11+/Edge

  } else {
    zrUtil.each(localNativeListenerNames.mouse, function(nativeEventName) { // forEach
      mountSingleDOMEventListener(scope, nativeEventName, function(event) { // addEventListener
        event = getNativeEvent(event);
        if (!scope.touching) { // 防止鼠标和触摸事件同时触发
          domHandlers[nativeEventName].call(instance, event);
        }
      })
    })
  }
}

function mountSingleDOMEventListener(scope, nativeEventName, listener, opt) {
  scope.mounted[nativeEventName] = listener;
  scope.listenerOpts[nativeEventName] = opt;
  scope.domTarget.addEventListener(nativeEventName, listener, opt);
}

class DOMHandlerScope {
  domTarget
  domHandlers
  mounted = {}
  listenerOpts = {}
  touching = false

  constructor(domTarget, domHandlers) {
    this.domTarget = domTarget;
    this.domHandlers = domHandlers;
  }
}
export default class HandlerDomProxy extends Eventful {
  dom

  handler 

  _localHandlerScope
  _globalHandlerScope = new DOMHandlerScope(document, )
  // [x, y]
  __mayPointerCapture

  constructor(dom, painterRoot) {
    super();
    this.dom = dom;
    this.painterRoot = painterRoot;

    if (env.domSupported) {
      this._globalHandlerScope = new DOMHandlerScope(document, globalDOMHandlers);
    }

    this._localHandlerScope = new DOMHandlerScope(dom, localDOMHandlers);
    mountLocalDOMEventListeners(this, this._localHandlerScope);
  }
}

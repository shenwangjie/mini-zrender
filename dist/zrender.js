(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.zrender = {}));
})(this, (function (exports) { 'use strict';

  const protoKey = '__proto__';

  const BUILTIN_OBJECT = reduce([
    'Function',
    'RegExp',
    'Date',
    'Error',
    'CanvasGradient',
    'CanvasPattern',
    // node-canvas
    'Image',
    'Canvas'
  ], (obj, val) => {
    obj['[object ' + val + ']'] = true;
    return obj;
  }, {});

  const TYPED_ARRAY = reduce([
    'Int8',
    'Uint8',
    'Uint8Clamped',
    'Int16',
    'Uint16',
    'Int32',
    'Uint32',
    'Float32',
    'Float64'
  ], (obj, val) => {
    obj['object ' + val + 'Array]'] = true;
    return obj;
  }, {});

  const objToString = Object.prototype.toString;

  const arrayProto = Array.prototype;
  const nativeForEach = arrayProto.forEach;
  const nativeSlice = arrayProto.slice;
  const nativeMap = arrayProto.map;

  let idStart =  0x0907;
  function guid() {
    return idStart++;
  }

  function keys(obj) {
    if (!obj) {
      return [];
    }

    if (Object.keys) {
      return Object.keys(obj);
    }
    let keyList = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        keyList.push(key);
      }
    }
    return keyList;
  }

  function createObject(proto = null, properties = null) {
    let obj;
    if (Object.create) {
      obj = Object.create(proto);
    } else {
      const StyleCtor = function () {};
      StyleCtor.prototype = proto;
      obj = new StyleCtor();
    }

    if (properties) {
      extend(obj, properties); // 对象拼接拿到新的obj
    }

    return obj;
  }

  function extend(target, obj) {
    if (Object.assign) {
      Object.assign(target, obj);
    } else {
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && key !== protoKey) {
          target[key] = obj[key];
        }
      }
    }
    return target;
  }

  function defaults(target, obj, overlay = undefined) {
    const keysArr = keys(obj);
    for (let i = 0; i < keysArr.length; i++ ) {
      let key = keysArr[i];
      if (overlay ? obj[key] != null : target[key] == null) { // 为null才会覆盖
        target[key] = obj[key];
      }
    }
    return target;
  }

  function mixin(target, obj, override = undefined) {
    target = 'prototype' in target ? target.prototype : target;
    obj = 'prototype' in obj ? obj.prototype : obj;

    if (Object.getOwnPropertyNames) {
      const keyList = Object.getOwnPropertyNames(obj);
      for (let i = 0; i < keyList.length; i ++) {
        const key = keyList[i];
        if (key !== 'constructor') {
          if (override ? obj[key] != null : target[key] == null) {
            target[key] = obj[key];
          }
        }
      }
    } else {
      defaults(target, obj, override);
    }
  }

  function disableUserSelect(dom) {
    const domStyle = dom.style;
    domStyle.webkitUserSelect = 'none';
    domStyle.userSelect = 'none';
    domStyle.webkitTapHighlightColor = 'rgba(0,0,0,0)';
    domStyle['webkit-touch-callout'] = 'none';
  }

  function isArrayLike(data) {
    if (!data) {
      return false;
    }
    if (typeof data === 'string') {
      return false;
    }
    return typeof data.length === 'number';
  }

  function isNumber(value) {
    // 在chromium和webkit上的表现判断方法比objToString.call更快
    // new Number()很少被使用
    return typeof value === 'number';
  }

  // 是否是NaN
  function eqNaN(value) {
    return value !== value;
  }

  function isArray(value) {
    if (Array.isArray) {
      return Array.isArray(value);
    }
    return objToString.call(value) === '[object Array]';
  }

  function isObject(value) {
    const type = typeof value;
    return type === 'function' || (!!value && type === 'object');
  }

  // 数组或对象遍历
  function each(arr, cb, context) {
    if (!(arr && cb)) {
      return;
    }
    if (arr.forEach && arr.forEach === nativeForEach) {
      arr.forEach(cb, context);
    } else if (arr.length === +arr.length) {
      // 转化为数字 +
      for (let i = 0, len = arr.length; i < len; i++) {
        cb.call(context, arr[i], i, arr);
      }
    } else {
      for (let key in arr) {
        if (arr.hasOwnProperty(key)) {
          cb.call(context, arr[key], key, arr);
        }
      }
    }
  }

  function slice(arr, ...args) {
    return nativeSlice.apply(arr, args);
    // return nativeSlice.call(arr, args[0], args[1], args[2]...);
  }

  function map(arr, cb, context) {
    if (!arr) {
      return [];
    }
    if (!cb) {
      return slice(arr);
    }
    if (arr.map && arr.map === nativeMap) {
      return arr.map(cb, context);
    } else {
      const result = [];
      for (let i = 0, len = arr.length; i < len; i++) {
        result.push(cb.call(context, arr[i], i, arr));
      }
      return result;
    }
  }

  function reduce(arr, cb, memo, context) {
    if (!(arr && cb)) return;
    for (let i = 0, len = arr.length; i < len; i++) {
      memo = cb.call(context, memo, arr[i], i, arr);
    }
    return memo;
  }

  // ownerDocument是Node对象的一个属性。返回的是某个元素的根节点文档对象，即document 对象
  // documentElement是document对象的属性，返回的是文档根节点。
  function isDom(value) {
    return typeof value === 'object'
        && typeof value.nodeType === 'number'
        && typeof value.ownerDocument === 'object'
  }

  function trim(str) {
    if (str == null) {
      return null;
    } else if (typeof str.trim === 'function') {
      return str.trim();
    } else {
      return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
  }

  /**
   * Normalize css liked array configuration
   * e.g.
   *  3 => [3, 3, 3, 3]
   *  [4, 2] => [4, 2, 4, 2]
   *  [4, 3, 2] => [4, 3, 2, 3]
   */
  function normalizeCssArray(val) {
    if (typeof (val) === 'number') {
      return [val, val, val, val];
    }
    const len = val.length;
    if (len === 2) {
      return [val[0], val[1], val[0], val[1]];
    } else if (len === 3) {
      return [val[0], val[1], val[2], val[1]];
    }
    return val;
  }

  function retrieve2(value0, value1) {
    return value0 != null
        ? value0
        : value1;
  }

  const primitiveKey = '__ec_primitive__';

  function isPrimitive(obj) {
    return obj[primitiveKey];
  }

  function clone(source) {
    if (source == null || typeof source !== 'object') {
      return source;
    }

    let result = source;
    const typeStr = objToString.call(source);
    if (typeStr === '[object Array]') {
      if (!isPrimitive(source)) ;
    } else if (TYPED_ARRAY[typeStr]) {
      if (!isPrimitive(source)) ;
    } else if (BUILTIN_OBJECT[typeStr]) {
      if (!isPrimitive(source) && !isDom(source)) ;
    }

    return result;
  }

  // console.error('这里的declear const wx: 用的真是太好了')

  class Browser {
    constructor() {
      this.firefox = false;
      this.ie = false;
      this.edge = false;
      this.newEdge = false;
      this.weChat = false;
      this.version = 0;
    }
  }

  class Env {
    constructor() {
      this.browser = new Browser();
      this.node = false;
      this.wxa = false;
      this.worker = false;

      this.svgSupported = false;
      this.touchEventSupported = false;
      this.pointerEventSupported = false;
      this.domSupported = false;
      this.transformSupported = false;
      this.transform3dSupported = false;

      this.hasGlobalWindow = typeof window !== 'undefined';
    }
  }

  const env = new Env();

  if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
    env.wxa = true; // 初步估测这个是代表微信环境
    env.touchEventSupported = true;
  } else if (typeof document === 'undefined' && typeof self != 'undefined') {
    env.worker = true;
    console.error('什么是in worker');
  } else if (!env.hasGlobalWindow || 'Deno' in window) {
    // 在node环境中
    env.node = true;
    env.svgSupported = true;
  } else {
    detect(navigator.userAgent, env);
  }

  function detect(ua, env) {
    const browser = env.browser;
    const firefox = ua.match(/Firefox\/([\d.]+)/);
    const ie = ua.match(/MSIE\s([\d.]+)/)
          // IE 11 Trident/7.0; rv:11.0
          || ua.match(/Trident\/.+?rv:(([\d.]+))/);
    const edge = ua.match(/Edge?\/([\d.]+)/); // IE 12 and 12+

    const weChat = (/micromessenger/i).test(ua);
    console.error('这些正则得看看');

    if (firefox) {
      browser.firefox = true;
      browser.version = firefox[1];
    }
    if (ie) {
      browser.ie = true;
      browser.version = ie[1];
    }
    if (edge) {
      browser.edge = true;
      browser.version = edge[1];
      browser.newEdge = +edge[1].split('.')[0] > 18;
      console.error('这个+是干嘛的');
    }

    // It is difficult to detect WeChat in Win Phone precisely, because ua can
      // not be set on win phone. So we do not consider Win Phone.
    if (weChat) {
      browser.weChat = true;
    }
  }

  class Eventful {
    _$handlers
    _$eventProcessor

    constructor() {
      this._$handlers = null;
    }

    on(event, query, handler, context) {
      // click (func click) Handler undefined
      if (!this._$handlers) {
        this._$handlers = {};
      }

      const _h = this._$handlers;

      if (typeof query === 'function') {
        context = handler;
        handler = query;
        query = null;
      }

      this._$eventProcessor;
      if (!_h[event]) {
        _h[event] = [];
      }

      const wrap = {
        h: handler,
        query,
        ctx: (context || this),
        callAtLast: handler.zrEventfulCallAtLast
      };

      const lastIndex = _h[event].length - 1;
      const lastWrap = _h[event][lastIndex];
      (lastWrap && lastWrap.callAtLast) 
        ? _h[event].splice(lastIndex, 0, wrap)
        : _h[event].push(wrap);

      return this;
    }

    trigger(eventType, ...args) {
      if (!this._$handlers) {
        return this;
      }

      const _h = this._$handlers[eventType];
      if (_h) {
        const argLen = args.length;

        const len = _h.length;
        for (let i = 0; i < len; i ++) {
          const hItem = _h[i];
          switch (argLen) {
            case 0: 
              hItem.h.call(hItem.ctx);
              break;
            case 1:
              hItem.h.call(hItem.ctx, args[0]);
              break;
            case 2:
              hItem.h.call(hItem.ctx, args[0], args[1]);
              break;
            default: 
              hItem.h.apply(hItem.ctx, args);
              break;
          }
        }
      }
      
      return this;
    }
  }

  const firefoxNotSupportOffsetXY = env.browser.firefox
      // FireFox >=39 才可以使用 offsetX/offsetY
      && +(env.browser.version).split('.')[0] < 39;

  function getNativeEvent(e) {
    return e || window.event; // For IE
  }

  function clientToLocal(el, e, out, calculate) {
    out = out || {};

    if (firefoxNotSupportOffsetXY && e.layerX != null && e.layerY && e.layerX !== e.offsetX) {
      out.zrX = e.layerX;
      out.zrY = e.layerY;
    } else if (e.offsetX != null) {
      // For IE6+, chrome, safari, opera, firefox >= 39
      out.zrX = e.offsetX;
      out.zrY = e.offsetY;
    } else {
      // 其他设备，如iOS safari
      calculateZrXY();
    }

    return out;
  }

  function calculateZrXY(el, e, out) {
    console.log('其他设备');
  }

  function getWheelDeltaMayPolyfill(e) {
    const rawWheelDelta = e.wheelDelta;
    if (rawWheelDelta) {
      return rawWheelDelta;
    }

    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    if (deltaX == null || deltaY == null) {
      return rawWheelDelta;
    }
  }

  function normalizeEvent(el, e, calculate) {
    e = getNativeEvent(e);

    if (e.zrX != null) {
      return e;
    }

    const eventType = e.type;
    const isTouch = eventType && eventType.indexOf('touch') >= 0;

    if (!isTouch) {
      clientToLocal(el, e, e);
      const wheelDelta = getWheelDeltaMayPolyfill(e);
      e.zrDelta = wheelDelta ? wheelDelta / 120 : -(e.detail || 0) / 3;
      // zrX/zrY/zrDelta
    }

    // const button = e.button;

    return e;
  }

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
    const pointerHandlerNames = map(mouseHandlerNames, function(name) {
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

      this.__mayPointerCapture;

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
  };

  each(['click', 'dbclick', 'contextmenu'], function(name) {
    localDOMHandlers[name] = function(event) {
      event = normalizeEvent(this.dom, event);
      this.trigger(name, event);
    };
  });

  const globalDOMHandlers = {

  };

  function mountLocalDOMEventListeners(instance, scope) {
    const domHandlers = scope.domHandlers;

    if (env.pointerEventSupported) ; else {
      each(localNativeListenerNames.mouse, function(nativeEventName) { // forEach
        mountSingleDOMEventListener(scope, nativeEventName, function(event) { // addEventListener
          event = getNativeEvent(event);
          if (!scope.touching) { // 防止鼠标和触摸事件同时触发
            domHandlers[nativeEventName].call(instance, event);
          }
        });
      });
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
  class HandlerDomProxy extends Eventful {
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

  const handlerNames = [
    'click', 'dbclick', 'mousewheel', 'mouseout',
    'mouseup', 'mousedown', 'mousemove', 'contextmenu'
  ];

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
      proxy = proxy || new EmptyProxy();
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
        each(handlerNames, function(name) {
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

  each(['click', 'mousedown', 'mouseup', 'mousewheel', 'dbclick', 'contextmenu'], function(name) {
    Handler.prototype[name] = function (event) { // trigger回调
      const x = event.zrX;
      const y = event.zrY;
      const isOutside = isOutsideBoundary(this, x, y);

      let hovered;

      if (name !== 'mouseup' || !isOutside) {
        hovered = this.findHover(x, y);
        hovered.target;
      }
      this.dispatchToElement(hovered, name, event);
    };
  });

  function setHoverTarget(list, out, x, y, exclude) {
    for (let i = list.length - 1; i >= 0; i--) {
      const el = list[i];
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

  function getTime() {
    return new Date().getTime()
  }

  class Animation extends Eventful {
    _head
    _tail

    constructor(opts) {
      super();
      opts = opts || {};
      this.stage = opts.stage || {};

      this._running = false; // 是否正在动画

      this._time = 0; // 时间戳
      this._pausedTime = 0; // 暂停的时间

      this._paused = false; // 暂停状态
    }

    update(notTriggerFrameAndStageUpdate = undefined) {
      const time = getTime() - this._pausedTime;
      const delta = time - this._time;
      let clip = this._head;
      while (clip) {
        const nextClip = clip.next;
        clip.step(time, delta);
        clip = nextClip;
      }

      this._time = time;

      if (!notTriggerFrameAndStageUpdate) {
        // console.error('这里不懂什么意思，只知道frame和帧有关')
        // 'frame' should be triggered before stage, because upper application
        // depends on the sequence (e.g., echarts-stream and finish
        // event judge)
        this.trigger('frame', delta);

        this.stage.update && this.stage.update();
      }
    }

    _startLoop() {
      const self = this;

      this._running = true;

      function step() {
        if (self._running) {
          requestAnimationFrame(step);
          !self._paused && self.update(); // 没暂停的情况就继续走update()
        }
      }

      requestAnimationFrame(step);
    }

    // 开始动画
    start() {
      if (this._running) {
        return
      }

      this._time = getTime();
      this._pausedTime = 0;

      this._startLoop();
    }

    // 停止动画
    stop() {
      this._running = false;
    }
    
    addAnimator(animator) {
      animator.animation = this;
      // const clip = animator.getClip();
      // if (clip) {
      //   this.addClip(clip);
      // }
    }

    addClip(clip) {
      if (!this._head) {
        this._head = this._tail = clip;
      }
      clip.animation = this;
    }
  }

  function sort(array, compare, lo, hi) {
    if (!lo) {
      lo = 0;
    }
    if (!hi) {
      hi = array.length;
    }

    var remaining = hi - lo;

    if (remaining < 2) {
      return;
    }
  }

  class Storage {
    _roots = [] // 存储element
    _displayList = [] // 存储element
    _displayListLen = 0

    constructor() {
      console.error('_roots和_displayList区别，一个存储Element，一个存储Displayable');
    }
    
    // 获取一串需要被渲染的elements
    getDisplayList(update = undefined) {
      const displayList = this._displayList;
      if (update || !displayList.length) {
        this.updateDisplayList();
      }
      return displayList;
    }

    /**
    * 更新图形的绘制队列。
    * 每次绘制前都会调用，该方法会先深度优先遍历整个树，更新所有Group和Shape的变换并且把所有可见的Shape保存到数组中，
    * 最后根据绘制的优先级（zlevel > z > 插入顺序）排序得到绘制队列
    */
    updateDisplayList() {
      this._displayListLen = 0;

      const displayList = this._displayList;
      const roots = this._roots;
      for (let i = 0, len = roots.length; i < len; i ++) {
        this._updateAndAddDisplayable(roots[i]);
      }
      
      displayList.length = this._displayListLen;
      sort(displayList);
    }

    _updateAndAddDisplayable(el) {
      el.beforeUpdate();
      el.update();
      el.afterUpdate();

      // const userSetClipPath = el.getClipPath();
      if (el.childrenRef) { // Group
        const children = el.childrenRef();
        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          // if (el.__dirty) {
          //   child.__dirty |= REDRAW_BIT;
          // }

          this._updateAndAddDisplayable(child);
        }
        el.__dirty = 0;
      } else {
        const disp = el;
        this._displayList[this._displayListLen++] = disp;
      }
    }

    addRoot(el) {
      this._roots.push(el);
    }
  }

  const painterCtors = {};
  let instances = {};

  class ZRender {
    animation

    _sleepAfterStill = 10; // 默认10帧后停止动画
    _stillFrameAccum = 0; // 一次动画后加1帧

    constructor(id, dom = null, opts = null) {
      this.id = id;
      this.dom = dom;

      this._needsRefresh = true;
      this._needsRefreshHover = true;

      opts = opts || {};

      const storage = new Storage(); // 创建存储实例

      let rendererType = opts.renderer || 'canvas'; // 渲染器种类

      const painter = new painterCtors[rendererType](dom, storage, opts, id); // 创建painter实例

      this.storage = storage;
      this.painter = painter;

      const handlerProxy = (!env.node && !env.worker) ? new HandlerDomProxy(painter.getViewportRoot(), painter.root): null;
      let pointerSize;

      this.handler = new Handler(storage, painter, handlerProxy, painter.root, pointerSize);

      this.animation = new Animation({
        stage: {
          update: () => this._flush(true)
        }
      });

      this.animation.start();
    }

    refreshImmediately(fromInside = undefined) {
      // Clear needsRefresh ahead to avoid something wrong happens in refresh
      // Or it will cause zrender refreshes again and again.
      this._needsRefresh = false;
      this.painter.refresh();
      // Avoid trigger zr.refresh in Element#beforeUpdate hook
      this._needsRefresh = false;
      // console.error('不知道为啥再写一遍');
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
        });
      } else if (this._sleepAfterStill > 0){
        this._stillFrameAccum++;
        // 10帧后停止动画
        if (this._stillFrameAccum > this._sleepAfterStill) {
          this.animation.stop();
        }
      }
    }

    trigger(eventName, event = null) {
      this.handler.trigger(eventName, event);
    }

    add(el) {
      this.storage.addRoot(el);
      el.addSelfToZr(this);
      this.refresh();
    }

    refresh() {
      this._needsRefresh = true;
      this.animation.start();
    }

    wakeUp() {
      this.animation.start();
      // 重置帧
      this._stillFrameAccum = 0;
    }
  }

  /**
   * 初始化一个 zrender 的实例
   * 入口方法
   */
  function init(dom = null, opts = null) {
    const zr = new ZRender(guid(), dom, opts);
    instances[zr.id] = zr;
    return zr;
  }

  function registerPainter(name, Ctor) {
    painterCtors[name] = Ctor;
  }

  const REDRAW_BIT = 1; // 0001
  const STYLE_CHANGED_BIT = 2; // 0010
  const SHAPE_CHANGED_BIT = 4; // 0100

  /**
   * 
   * 3x2矩阵操作类
   */
  function create() {
    return [1, 0, 0, 1, 0, 0];
  }

  // 复制
  function copy(out, m) {
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[3];
    out[4] = m[4];
    out[5] = m[5];
    return out;
  }

  // 旋转变换
  function rotation(out, a, rad, pivot = [0, 0]) {
    const aa = a[0];
    const ac = a[2];
    const atx = a[4];
    const ab = a[1];
    const ad = a[3];
    const aty = a[5];
    const st = Math.sin(rad);
    const ct = Math.cos(rad);

    out[0] = aa * ct + ab * st;
    out[1] = -aa * st + ab * ct;
    out[2] = ac * ct + ad * st;
    out[3] = -ac * st + ct * ad;
    out[4] = ct * (atx - pivot[0]) + st * (aty - pivot[1]) + pivot[0];
    out[5] = ct * (aty - pivot[1]) - st * (atx - pivot[0]) + pivot[1];
    return out;
  }

  // 求逆矩阵
  function invert(out, a) {

    const aa = a[0];
    const ac = a[2];
    const atx = a[4];
    const ab = a[1];
    const ad = a[3];
    const aty = a[5];

    let det = aa * ad - ab * ac;
    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
  }

  const EPSILON = 5e-5;
  function isNotAroundZero(val) {
    return val > EPSILON || val < -EPSILON;
  }
  class Transformable {

    getLocalTransform(m) {
      return Transformable.getLocalTransform(this, m);
    }
    
    // 更新全局的transform（position等等）
    updateTransform() {
      const parentTransform = this.parent && this.parent.transform;
      const needLocalTransform = this.needLocalTransform();

      let m = this.transform;
      if (!(needLocalTransform || parentTransform)) {
        if (m) {
          this.invTransform = null;
        }
        return;
      }

      m = m || create();

      if (needLocalTransform) {
        this.getLocalTransform(m);
      }

      if (parentTransform) {
        if (needLocalTransform) ; else {
          copy(m, parentTransform);
        }
      }

      // 保存矩阵变换
      this.transform = m;

      this._resolveGlobalScaleRatio(m);
      return;
    }

    _resolveGlobalScaleRatio(m) {
      this.globalScaleRatio;

      // 逆变换
      this.invTransform = this.invTransform || create();
      invert(this.invTransform, m);
    }

    static getLocalTransform(target, m) {
      m = m || [];
      const ox = target.originX || 0;
      const oy = target.originY || 0;
      const sx = target.scaleX;
      const sy = target.scaleY;
      const ax = target.anchorX;
      const ay = target.anchorY;
      const rotation$1 = target.rotation || 0;
      const x = target.x;
      const y = target.y;
      const skewX = target.skewX ? Math.tan(target.skewX) : 0;
      const skewY = target.skewY ? Math.tan(-target.skewY) : 0;

      if (ox || oy || ax || ay) {
        const dx = ox + ax;
        const dy = oy + ay;
        m[4] = -dx * sx - skewX * dy * sy;
        m[5] = -dy * sy - skewY * dx * sx;
      } else {
        m[4] = m[5] = 0;
      }
      // scale
      m[0] = sx;
      m[3] = sy;
      // skew
      m[1] = skewY * sx;
      m[2] = skewX * sy;
      // rotation
      rotation$1 && rotation(m, m, rotation$1);

      m[4] += ox + x;
      m[5] += oy + y;
      return m;
    }

    getGlobalScale(out) {
      const m = this.transform;
      out = out || [];
      if (!m) {
        out[0] = 1;
        out[1] = 1;
        return out;
      }
      // 缩放和倾斜的平方根
      out[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
      out[1] = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
      if (m[0] < 0) {
        out[0] = -out[0];
      }
      if (m[3] < 0) {
        out[1] = -out[1];
      }
      return out;
    }

    // 是否需要计算transform
    needLocalTransform() {
      return isNotAroundZero(this.rotation)
          || isNotAroundZero(this.x)
          || isNotAroundZero(this.y)
          || isNotAroundZero(this.scaleX - 1)
          || isNotAroundZero(this.scaleY - 1)
          || isNotAroundZero(this.skewX)
          || isNotAroundZero(this.skewY);
    }

    static initDefaultProps = (function () {
      const proto = Transformable.prototype;
      proto.scaleX =
      proto.scaleY =
      proto.globalScaleRatio = 1;
      proto.x =
      proto.y =
      proto.originX =
      proto.originY =
      proto.skewX =
      proto.skewY =
      proto.rotation =
      proto.anchorX =
      proto.anchorY = 0;
    })()
  }

  class Clip {
    _life
    _delay
    _startTime

    loop

    _pausedTime = 0

    animation

    onframe
    ondestroy
    onrestart

    easingFunc

    // 只读
    next
    prev

    _inited = false

    constructor(opts) {
      this._life = opts.life || 1000;
      this._delay = opts.delay || 0;
      this.loop = opts.loop || false;
      this.onframe = opts.onframe || function(){};
      this.ondestroy = opts.ondestroy || function(){};
      this.onrestart = opts.onrestart || function(){};
    }

    step(globalTime, deltaTime) {
      if (!this._inited) {
        this._startTime = globalTime + this._delay;
        this._inited = true;
      }

      let elapsedTime = globalTime - this._startTime - this._pausedTime;
      let percent = elapsedTime / this._life;
      if (percent < 0) {
        percent = 0;
      }
      percent = Math.min(percent, 1);
      const easingFunc = this.easingFunc;
      const schedule = easingFunc ? easingFunc(percent) : percent;

      this.onframe(schedule);

      if (percent == 1) {
        if (this.loop) {
          const remainder = elapsedTime % this._life;
          this._startTime = globalTime - remainder;
          this._pausedTime = 0;

          this.onrestart();
        } else {
          return true;
        }
      }
      return false;
    }
  }

  function cloneValue(value) {
    if (isArrayLike(value)) ;
    return value;
  }
  // 判断几维数组
  function guessArrayDim(value) {
    return isArrayLike(value && value[0]) ? 2 : 1;
  }

  const VALUE_TYPE_NUMBER = 0;
  const VALUE_TYPE_1D_ARRAY = 1;
  const VALUE_TYPE_2D_ARRAY = 2;
  const VALUE_TYPE_COLOR = 3;
  const VALUE_TYPE_UNKOWN = 6;

  function interpolateNumber(p0, p1, percent) {
    return (p1 - p0) * percent + p0;
  }

  function interpolate1DArray(out, p0, p1, percent) {
    const len = p0.length;
    for (let i = 0; i < len; i++) {
      out[i] = interpolateNumber(p0[i], p1[i], percent);
    }
    return out;
  }

  function interpolate2DArray(out, p0, p1, percent) {
    const len = p0.length;
    const len2 = len && p0[0].length;
    for (let i = 0; i < len; i++) {
      if (!out[i]) {
        out[i] = [];
      }
      for (let j = 0; j < len2; j++) {
        out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
      }
    }
    return out;
  }

  function fillArray(val0, val1, arrDim) {
    let arr0 = val0[0];
    let arr1 = val1[0];
    if (!arr0.push || !arr1.push) {
      return;
    }
    arr0.length;
    arr1.length;

    arr0[0] && arr0[0].length;
    for (let i = 0; i < arr0.length; i++) {
    }
  }

  class Animator {
    animation

    _tracks = {}
    _trackKeys = []

    targetName

    _onframeCbs
    _doneCbs

    _clip = null

    _loop
    _delay
    _maxTime = 0

    // 0: Not started
    // 1: Invoked started
    // 2: 已经至少跑了1帧
    _started = 0
    
    constructor(target, loop) {
      this._target = target;
      this._loop = loop;
    }

    // 添加动画每一帧的回调函数
    during(cb) {
      if (cb) {
        if (!this._onframeCbs) {
          this._onframeCbs = [];
        }
        this._onframeCbs.push(cb);
      }
      return this;
    }

    // 添加完成动画的回调函数
    done(cb) {
      if (cb) {
        if (!this._doneCbs) {
          this._doneCbs = [];
        }
        this._doneCbs.push(cb);
      }
      return this;
    }

    getClip() {
      return this._clip;
    }

    // 设置动画帧
    when(time, props, easing) {
      return this.whenWithKeys(time, props, keys(props), easing);
    }

    whenWithKeys(time, props, propNames, easing) {
      const tracks = this._tracks;
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        let track = tracks[propName];
        if (!track) {
          track = tracks[propName] = new Track(propName);

          let initialValue = this._target[propName];
          if (initialValue == null) {
            console.error('非法属性：' + propName);
            continue;
          }

          if (time > 0) {
            track.addKeyFrame(0, cloneValue(initialValue), easing);
          }

          this._trackKeys.push(propName);
        }
        track.addKeyFrame(time, cloneValue(props[propName]), easing);
      }
      this._maxTime = Math.max(this._maxTime, time);
      return this;
    }

    // 开始动画
    start(easing) {
      if (this._started > 0) {
        return
      }
      this._started = 1;

      const self = this;

      const tracks = [];
      const maxTime = this._maxTime || 0;
      for (let i = 0; i < this._trackKeys.length; i++) {
        const propName = this._trackKeys[i];
        const track = this._tracks[propName];
        track.prepare(maxTime, undefined);
        if (track.needsAnimate()) {
          tracks.push(track);
        }
      }

      if (tracks.length) {
        const clip = new Clip({
          life: maxTime,
          loop: this._loop,
          delay: this._delay || 0,
          onframe(percent) {
            self._started = 2;

            for (let i = 0; i < tracks.length; i++) {
              tracks[i].step(self._target, percent);
            }

            const onframeList = self._onframeCbs;
            if (onframeList) {
              for (let i = 0; i < onframeList.length; i++) {
                onframeList[i](self._target, percent);
              }
            }
          },
          ondestroy() {}
        });
        this._clip = clip;

        if (this.animation) {
          this.animation.addClip(clip);
        }
      }
      return this;
    }
  }

  function isArrayValueType(valType) {
    return valType === VALUE_TYPE_1D_ARRAY || valType === VALUE_TYPE_2D_ARRAY;
  }

  class Track {
    keyframes = []
    propName
    valType
    discrete = false

    _lastFrame = 0

    _additiveTrack

    constructor(propName) {
      this.propName = propName;
    }

    addKeyFrame(time, rawValue, easing) {
      let valType = VALUE_TYPE_UNKOWN;

      let keyframes = this.keyframes;
      let len = keyframes.length;

      let discrete = false;
      let value = rawValue;

      if (isArrayLike(rawValue)) {
        let arrayDim = guessArrayDim(rawValue);
        valType = arrayDim;
        if (arrayDim === 1 && !isNumber(rawValue[0])
            || arrayDim === 2 && !isNumber(rawValue[0][0])) {
              discrete = true;
            }
      } else {
        if (isNumber(rawValue) && !eqNaN(rawValue)) {
          valType = VALUE_TYPE_NUMBER;
        }
      }

      if (len === 0) {
        this.valType = valType;
      }

      this.discrete = this.discrete || discrete;

      const kf = {
        time,
        value,
        rawValue,
        percent: 0
      };
      keyframes.push(kf);
      return kf;
    }

    prepare(maxTime, additiveTrack) {
      let kfs = this.keyframes;
      const kfsLen = kfs.length;
      const isDiscrete = this.discrete;
      const isArr = isArrayValueType(this.valType);
      for (let i = 0; i < kfsLen; i++) {
        const kf = kfs[i];
        // 修改了percent
        kf.percent = kf.time / maxTime;
        if (!isDiscrete) {
          if (isArr && i !== kfsLen - 1) {
            fillArray(kf.value, kfs[kfsLen - 1].value, this.valType);
          }
        }
      }
    }

    needsAnimate() {
      return this.keyframes.length >= 1;
    }

    step(target, percent) {
      const keyframes = this.keyframes;
      const kfsNum = keyframes.length;

      let frameIdx;
      const lastFrame = this._lastFrame;
      const mathMin = Math.min;
      let frame, nextFrame;
      if (kfsNum === 1) ; else {
        for (frameIdx = lastFrame; frameIdx < kfsNum; frameIdx++) {
          if (keyframes[frameIdx].percent > percent) {
            break;
          }
        }
        frameIdx = mathMin(frameIdx - 1, kfsNum - 2);

        nextFrame = keyframes[frameIdx + 1];
        frame = keyframes[frameIdx];
      }

      const isAdditive = this._additiveTrack != null;
      const valueKey = isAdditive ? 'additiveValue' : 'value';
      const propName = this.propName;

      const interval = nextFrame.percent - frame.percent;
      let w = interval === 0 ? 1 : mathMin((percent - frame.percent) / interval, 1);

      const valType = this.valType;
      const isValueColor = valType === VALUE_TYPE_COLOR;

      let targetArr = isAdditive ? this._additiveValue : target[propName];
      if ((isArrayValueType(valType) || isValueColor) && !targetArr) {
        targetArr = this._additiveValue = [];
      }
      if (this.discrete) ; else if (isArrayValueType(valType)) {
        valType === VALUE_TYPE_1D_ARRAY
            ? interpolate1DArray(targetArr, frame[valueKey], nextFrame[valueKey], w)
            : interpolate2DArray(targetArr, frame[valueKey], nextFrame[valueKey], w);
      } else {
        const value = interpolateNumber(frame[valueKey], nextFrame[valueKey], w);
        target[propName] = value;
      }
    }
  }

  class Element {
    id = guid()

    animators = []

    // parent

    constructor(props = null) {
      this._init(props);
    }

    _init(props) {
      // Init default properties
      this.attr(props);
    }

    attr(keyOrObj, value) {
      if (typeof keyOrObj === 'string') {
        this.attrKV(keyOrObj, value);
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
      if (key === 'textConfig') ; else if (key === 'textContent') ; else if (key === 'clipPath') ; else if (key === 'extra') ; else {
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

      });

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
          });
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

  const STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));

  const DEFAULT_COMMON_STYLE$1 = {
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000',
    opacity: 1,
    blend: 'source-over'
  };

  DEFAULT_COMMON_STYLE$1[STYLE_MAGIC_KEY] = true;
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
        obj = this.createStyle(obj);
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

  // 求两个向量最小值
  function min$1(out, v1, v2) {
    out[0] = Math.min(v1[0], v2[0]);
    out[1] = Math.min(v1[1], v2[1]);
    return out;
  }

  // 求两个向量最大值
  function max$1(out, v1, v2) {
    out[0] = Math.max(v1[0], v2[0]);
    out[1] = Math.max(v1[1], v2[1]);
    return out;
  }

  const PI2 = Math.PI * 2;

  function fromArc(x, y, rx, ry, startAngle, endAngle, anticlockwise, min, max) {
    // const vec2Min = vec2.min;
    // const vec2Max = vec2.max;

    const diff = Math.abs(startAngle - endAngle);

    // 是一个圆
    if (diff % PI2 < 1e-4 && diff > 1e-4) {
      min[0] = x - rx;
      min[1] = y - ry;
      max[0] = x + rx;
      max[1] = y + ry;
      return;
    }

  }

  class BoundingRect {
    x
    y
    width
    height

    constructor(x, y, width, height) {
      if (width < 0) {
        x = x + width;
        width = -width;
      }
      if (height < 0) {
        y = y + height;
        height = -height;
      }

      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }

  let dpr = 1;

  // 如果在浏览器环境中
  if (env.hasGlobalWindow) {
    dpr = Math.max(
      window.devicePixelRatio
      || (window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI)
      || 1, 1
    );
    // deviceXDPI 返回显示屏幕的每英寸水平点数。
    // logicalXDPI 返回显示屏幕每英寸的水平方向的常规点数。
  }
  // retina 屏幕优化
  const devicePixelRatio = dpr;

  const hasTypedArray = typeof Float32Array !== 'undefined';

  const CMD = {
    M: 1,
    L: 2,
    C: 3,
    Q: 4,
    A: 5,
    Z: 6,
    R: 7
  };

  const min = [];
  const max = [];
  const min2 = [];
  const max2 = [];

  const mathAbs = Math.abs;
  const mathCos = Math.cos;
  const mathSin = Math.sin;

  const tmpAngles = [];

  class PathProxy {
    _len = 0

    // Unit x, Unit y 阻止绘制过短的线段
    // 不用private的话会显示undefine，就会出现问题
    // _ux
    // _uy

    _xi = 0
    _yi = 0

    constructor(notSaveData) {
      if (notSaveData) {
        this._saveData = false;
      }

      if (this._saveData) {
        this.data = [];
      }
    }

    setScale(sx, sy, segmentIgnoreThreshold) {
      segmentIgnoreThreshold = segmentIgnoreThreshold || 0;
      if (segmentIgnoreThreshold > 0) {
        this._ux = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sx) || 0;
        this._uy = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sy) || 0;
      }
    }

    setDPR(dpr) {
      this.dpr = dpr;
    }

    setContext(ctx) {
      this._ctx = ctx;
    }

    getContext() {
      return this._ctx;
    }

    reset() {
      if (this._saveData) {
        this._len = 0;
      }

      this._version++;
    }

    _drawPendingPt() {

    }

    toStatic() {
      this._drawPendingPt();

      const data = this.data;
      if (data instanceof Array) {
        data.length = this._len;
      }
    }

    addData(cmd, a, b ,c, d, e, f, g, h) {
      let data = this.data;
      if (this._len + arguments.length > data.length) {
        this._expandData();
        data = this.data;
      }
      for (let i = 0; i < arguments.length; i ++) {
        data[this._len++] = arguments[i];
      }
    }

    _expandData() {

    }

    moveTo(x, y) {
      this.addData(CMD.M, x, y);
      this._ctx && this._ctx.moveTo(x, y);

      this._x0 = x;
      this._y0 = y;
      this._xi = x;
      this._yi = y;
      
      return this;
    }

    lineTo(x, y) {
      const dx = mathAbs(x - this._xi);
      const dy = mathAbs(y - this._yi);
      const exceedUnit = dx > this._ux || dy > this._uy;

      this.addData(CMD.L, x, y);

      if (this._ctx && exceedUnit) {
        this._ctx.lineTo(x, y);
      }
      if (exceedUnit) {
        this._xi = x;
        this._yi = y;
      } 

      return this;
    }

    arc(cx, cy, r, startAngle, endAngle, anticlockwise) {
      this._drawPendingPt();

      tmpAngles[0] = startAngle;
      tmpAngles[1] = endAngle;

      startAngle = tmpAngles[0];
      endAngle = tmpAngles[1];

      let delta = endAngle - startAngle;

      this.addData(
        CMD.A, cx, cy, r, r, startAngle, delta, 0, anticlockwise ? 0 : 1
      );

      this._ctx && this._ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);

      this._xi = mathCos(endAngle) * r + cx;
      this._yi = mathSin(endAngle) * r + cy;
      return this;
    }

    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
      this.addData(CMD.C, x1, y1, x2, y2, x3, y3);
      if (this._ctx) {
        this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      }
      this._xi = x3;
      this._yi = y3;
      return this;
    }

    closePath() {
      // Add pending point for previous path.
      this._drawPendingPt();

      this.addData(CMD.Z);

      const ctx = this._ctx;
      const x0 = this._x0;
      const y0 = this._y0;
      if (ctx) {
          ctx.closePath();
      }

      this._xi = x0;
      this._yi = y0;
      return this;
    }

    rebuildPath(ctx, percent) {
      const data = this.data;
      const len = this._len;
      const ux = this._ux;
      const uy = this._uy;
      let xi, yi;
      let x, y;
      for (let i = 0; i < len;) {
        const cmd = data[i++];
        const isFirst = i === 1;

        if (isFirst) {
          xi = data[i];
          yi = data[i + 1];
        }

        switch(cmd) {
          case CMD.M: 
              xi = data[i++];
              yi = data[i++];
              ctx.moveTo(xi, yi);
              break;
          case CMD.L:
              x = data[i++];
              y = data[i++];
              const dx = mathAbs(x - xi);
              const dy = mathAbs(y - yi);
              if (dx > ux || dy > uy) {
                ctx.lineTo(x, y);
                xi = x;
                yi = y;
              }
              break;
          case CMD.A:
              const cx = data[i++];
              const cy = data[i++];
              const rx = data[i++];
              const ry = data[i++];
              let startAngle = data[i++];
              let delta = data[i++];
              const psi = data[i++];
              const anticlockwise = !data[i++];
              const r = rx > ry ? rx : ry;
              const isEllipse = mathAbs(rx - ry) > 1e-3;
              let endAngle = startAngle + delta;

              if (isEllipse && ctx.ellipse) {
                ctx.ellipse(cx, cy, rx, ry, psi, startAngle, endAngle, anticlockwise);
              } else {
                ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
              }

              xi = mathCos(endAngle) * rx + cx;
              yi = mathSin(endAngle) * ry + cy;
              break;
        }
      }
    }

    beginPath() {
      this._ctx && this._ctx.beginPath();
      this.reset();
      return this;
    }

    len() {
      return this._len;
    }

    appendPath(path) {
      if (!path instanceof Array) {
        path = [path];
      }
      const len = path.length;
      let appendSize = 0;
      let offset = this._len;
      for (let i = 0; i < len; i++) {
        appendSize += path[i].len();
      }
      if (hasTypedArray && (this.data instanceof Float32Array)) ;
      for (let i = 0; i < len; i++) {
        const appendPathData = path[i].data;
        for (let k = 0; k < appendPathData.length; k++) {
          this.data[offset++] = appendPathData[k];
        }
      }
      this._len = offset;
      // _len和data的处理
    }

    setData(data) {
      const len = data.length;

      if (!(this.data && this.data.length === len) && hasTypedArray) {
          this.data = new Float32Array(len);
      }

      for (let i = 0; i < len; i++) {
          this.data[i] = data[i];
      }

      this._len = len;
    }

    getBoundingRect() {
      min[0] = min[1] = min2[0] = min2[1] = Number.MAX_VALUE;
      max[0] = max[1] = max2[0] = max2[1] = -Number.MAX_VALUE;

      const data = this.data;
      let xi = 0; let yi = 0;
      let x0 = 0; let y0 = 0;
      
      let i;
      for (i = 0; i < this._len;) {
        const cmd = data[i++];

        const isFirst = i === 1;
        if (isFirst) {
          xi = data[i];
          yi = data[i + 1];
          x0 = xi;
          y0 = yi;
        }

        switch(cmd) {
          case CMD.M:
            xi = x0 = data[i++];
            yi = y0 = data[i++];
            min2[0] = x0;
            min2[i] = y0;
            max2[0] = x0;
            max2[1] = y0;
            break;
          case CMD.A: 
            const cx = data[i++];
            const cy = data[i++];
            const rx = data[i++];
            const ry = data[i++];
            const startAngle = data[i++];
            const endAngle = data[i++] + startAngle;

            // arc 旋转
            i += 1;
            const anticlockwise = !data[i++];

            fromArc(
              cx, cy, rx, ry, startAngle, endAngle, anticlockwise, min2, max2
            );

            xi = mathCos(endAngle) * rx + cx;
            yi = mathSin(endAngle) * ry + cy;
            break;
        }

        min$1(min, min, min2);
        max$1(max, max, max2);
      }

      return new BoundingRect(
        min[0], min[1], max[0] - min[0], max[1] - min[1]
      );
    }

    static initDefaultProps = (function () {
      const proto = PathProxy.prototype;
      proto._saveData = true;
      proto._ux = 0;
      proto._uy = 0;
      proto._version = 0;
    })()
  }

  const DEFAULT_PATH_STYLE = defaults({
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
  }, DEFAULT_COMMON_STYLE$1);

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
        this.useStyle({});
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

    dirtyShape() {
      this.__dirty |= SHAPE_CHANGED_BIT;
      if (this._rect) {
        this._rect = null;
      }
      this.markRedraw();
    }

    getUpdatedPathProxy(inBatch) {
      !this.path && this.createPathProxy();
      this.path.beginPath();
      this.buildPath(this.path, this.shape, inBatch);
      return this.path;
    }

    getBoundingRect() {
      let rect = this._rect;
      this.style;
      const needsUpdateRect = !rect;
      if (needsUpdateRect) {
        let firstInvoke = false;
        if (!this.path) {
          firstInvoke = true;
          this.createPathProxy();
        }
        let path = this.path;
        if (firstInvoke || (this.__dirty & SHAPE_CHANGED_BIT)) {
          path.beginPath();
          this.buildPath(path, this.shape, false);
          this.pathUpdated();
        }
        rect = path.getBoundingRect();
      }

      this._rect = rect;

      return rect;
    }

    shapeChanged() {
      return !!(this.__dirty & SHAPE_CHANGED_BIT);
    }

    // 自己定义一个形状，如星星
    static extend(defaultProps) {
      class Sub extends Path {
        getDefaultStyle() {
          return clone(defaultProps.style);
        }

        getDefaultShape() {
          return clone(defaultProps.shape);
        }

        constructor(opts) {
          super(opts);
          defaultProps.init && defaultProps.init.call(this, opts);
        }
      }

      for (let key in defaultProps) {
        if (typeof defaultProps[key] === 'function') {
          Sub.prototype[key] = defaultProps[key];
        }
      }

      return Sub;
    }

    static initDefaultProps = (function () {
      const pathProto = Path.prototype;
      pathProto.type = 'path';
      pathProto.strokeContainThreshold = 5;
      pathProto.segmentIgnoreThreshold = 0;
      pathProto.subPixelOptimize = false;
      pathProto.autoBatch = false; // 元素能被自动批量处理
      pathProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT | SHAPE_CHANGED_BIT;
    })()  
  }

  function isPathProxy(path) {
    return path.setData != null;
  }
  // 合并路径
  function mergePath(pathEls, opts) {
    const pathList = [];
    const len = pathEls.length;
    for (let i = 0; i < len; i++) {
      const pathEl = pathEls[i];
      pathList.push(pathEl.getUpdatedPathProxy(true));
    }

    const pathBundle = new Path(opts);
    pathBundle.createPathProxy();
    pathBundle.buildPath = function (path) {
      if (isPathProxy(path)) {
        path.appendPath(pathList);
        // svg and vml renderer dont have context
        const ctx = path.getContext();
        if (ctx) {
          path.rebuildPath(ctx, 1);
        }
      }
    };

    return pathBundle;
  }

  var path = /*#__PURE__*/Object.freeze({
    __proto__: null,
    mergePath: mergePath
  });

  class BezierCurveShape {
    constructor(cpx2 = undefined, cpy2 = undefined) {
      this.x1 = 0;
      this.y1 = 0;
      this.x2 = 0;
      this.y2 = 0;
      this.cpx1 = 0;
      this.cpy1 = 0;
      this.cpx2 = cpx2;
      this.cpy2 = cpy2;
      
      this.percent = 1;
    }
  }

  class BezierCurve extends Path {
    constructor(opts = null) {
      super(opts);
    }

    getDefaultStyle() {
      return {
        stroke: '#000',
        fill: null
      }
    }

    getDefaultShape() {
      return new BezierCurveShape();
    }

    buildPath(path, shape) {
      let x1 = shape.x1;
      let y1 = shape.y1;
      let x2 = shape.x2;
      let y2 = shape.y2;
      let cpx1 = shape.cpx1;
      let cpx2 = shape.cpx2;
      let cpy1 = shape.cpy1;
      let cpy2 = shape.cpy2;
      let percent = shape.percent;
      if (percent === 0) {
        return;
      }

      path.moveTo(x1, y1);

      if (cpx2 == null || cpy2 == null) ; else {
        path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      }
    }
    
  }

  BezierCurve.prototype.type = 'bezier-curve';

  function buildPath(ctx, shape, closePath) {
    const smooth = shape.smooth;
    let points = shape.points;
    if (points && points.length >= 2) {
      if (smooth) ; else {
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1, l = points.length; i < l; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
      }
    
      closePath && ctx.closePath();
    } 
  }

  /**
   * 折线
   */

  class PolylineShape {
    points = null 
    smooth = 0 // 折线图会变成平滑的贝塞尔曲线
  }

  class Polyline extends Path {
    constructor(opts) {
      super(opts);
    }

    buildPath(ctx, shape) {
      buildPath(ctx, shape, false);
    }

    getDefaultShape() {
      return new PolylineShape();
    }

    getDefaultStyle() {
      return {
        stroke: '#000',
        fill: null
      }
    }
  }

  Polyline.prototype.type = 'polyline';

  /**
   * 多边形
   */

  class PolygonShape {
    points = null
    smooth = 0
    smoothConstraint = null
  }

  class Polygon extends Path {
    constructor(opts) {
      super(opts);
    }

    getDefaultShape() {
      return new PolygonShape();
    }

    buildPath(ctx, shape) {
      buildPath(ctx, shape, true);
    }
  }

  Polygon.prototype.type = 'polygon';

  /**
   * 圆形
   */

  class CircleShape {
    cx = 0
    cy = 0
    r = 0
  }

  class Circle extends Path {

    constructor(opts) {
      super(opts);
    }

    getDefaultShape() {
      return new CircleShape();
    }

    buildPath(ctx, shape) {
      ctx.moveTo(shape.cx + shape.r, shape.cy);
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    }
  }
  Circle.prototype.type = 'circle';

  /**
   * 直线
   */

  class LineShape {
    x1 = 0
    y1 = 0

    x2 = 0
    y2 = 0

    percent = 1
  }

  class Line extends Path {
    constructor(opts) {
      super(opts);
    }

    getDefaultStyle() {
      return {
        stroke: '#000',
        fill: null
      }
    }

    getDefaultShape() {
      return new LineShape();
    }

    buildPath(ctx, shape) {
      let x1, y1;
      let x2, y2;

      x1 = shape.x1;
      y1 = shape.y1;
      x2 = shape.x2;
      y2 = shape.y2;

      const percent = shape.percent;

      if (percent === 0) {
        return;
      }

      ctx.moveTo(x1, y1);
      if (percent < 1) {
        x2 = x1 * (1 - percent) + x2 * percent;
        y2 = y1 * (1 - percent) + y2 * percent;
      }
      ctx.lineTo(x2, y2);
    }
  }

  Line.prototype.type = 'line';

  const DEFAULT_FONT_SIZE = 12;
  const DEFAULT_FONT_FAMILY = 'sans-serif';
  const DEFAULT_FONT = `${DEFAULT_FONT_SIZE}px ${DEFAULT_FONT_FAMILY}`;
  const platformApi = {
    createCanvas() {
      return typeof document !== 'undefined' 
      && document.createElement('canvas');
    },

    measureText: (function() {
      let _ctx;
      let _cachedFont;
      return (text, font = undefined) => {
        if (!_ctx) {
          const canvas = platformApi.createCanvas();
          _ctx = canvas && canvas.getContext('2d');
        }
        if (_ctx) {
          if (_cachedFont !== font) {
            _cachedFont = _ctx.font = font || DEFAULT_FONT;
          }
          return _ctx.measureText(text);
        } 
      }
    })(),
  };

  class Entry {
    value

    constructor(val) {
      this.value = val;
    }
  }

  class LinkedList {
    _len = 0

    len() {
      return this._len;
    }

    insertEntry(entry) {
      if (!this.head) {
        this.head = this.tail = entry;
      }
      this._len++;
    }
  }

  class LRU {
    _list = new LinkedList()
    _maxSize = 10
    _map = {}
    
    constructor(maxSize) {
      this._maxSize = maxSize;
    }

    get(key) {
      this._map[key];
      this._list;
    }

    put(key, value) {
      const list = this._list;
      const map = this._map;
      let removed = null;
      if (map[key] == null) {
        const len = list.len();
        let entry = this._lastRemovedEntry;

        if (len >= this._maxSize && len > 0) ;

        if (entry) ; else {
          entry = new Entry(value);
        }
        entry.key = key;
        list.insertEntry(entry);
        map[key] = entry;
      }

      return removed;
    }
  }

  let textWidthCache = {};

  function getWidth(text, font) {
    font = font || DEFAULT_FONT;
    let cacheOfFont = textWidthCache[font];
    if (!cacheOfFont) {
      cacheOfFont = textWidthCache[font] = new LRU(500);
    }
    let width = cacheOfFont.get(text);
    if (width == null) { // undefined == null
      width = platformApi.measureText(text, font).width;
      cacheOfFont.put(text, width);
    }

    return width;
  }

  function getLineHeight(font) {
    return getWidth('国', font);
  }

  function adjustTextY(y, height, verticalAlign) {
    if (verticalAlign === 'middle') {
      y -= height / 2;
    } else if (verticalAlign === 'bottom') {
      y -= height;
    }
    return y;
  }

  const DEFAULT_TSPAN_STYLE = defaults({
    strokeFirst: true,
    font: DEFAULT_FONT,
    x: 0,
    y: 0,
    textAlign: 'left',
    textBaseline: 'top',
    miterLimit: 2
  }, DEFAULT_PATH_STYLE);

  class TSpan extends Displayable {
    createStyle(obj) {
      return createObject(DEFAULT_TSPAN_STYLE, obj);
    }

    hasStroke() {
      const style = this.style;
      const stroke = style.stroke;
      return stroke != null && stroke !== 'none' && style.lineWidth > 0;
    }

    static initDefaultProps = (function () {
      const tspanProto = TSpan.prototype;
      tspanProto.dirtyRectTolerance = 10;
    })()
  }

  TSpan.prototype.type = 'tspan';

  function parsePlainText(text, style) {
    text != null && (text += '');

    style.overflow;
    style.padding;
    const font = style.font;
    const calculatedLineHeight = getLineHeight(font);
    const lineHeight = retrieve2(style.lineHeight, calculatedLineHeight);
    !!(style.backgroundColor);
    style.lineOverflow === 'truncate';

    let width = style.width;
    let lines;
    if (width != null) ; else {
      lines = text ? text.split('\n') : [];
    }

    const contentHeight = lines.length * lineHeight;
    const height = retrieve2(style.height, contentHeight); // height

    let outerHeight = height;
    let contentWidth = 0;
    for (let i = 0; i < lines.length; i++) {
      contentWidth = Math.max(getWidth(lines[i], font), contentWidth);
    }
    if (width == null) {
      width = contentWidth;
    } // width

    let outerWidth = contentWidth;

    return {
      lines: lines,
      height: height,
      outerWidth: outerWidth,
      outerHeight: outerHeight,
      lineHeight: lineHeight,
      calculatedLineHeight: calculatedLineHeight,
      contentWidth: contentWidth,
      contentHeight: contentHeight,
      width: width
    };
  }

  const DEFAULT_RICH_TEXT_COLOR = {
    fill: '#000'
  };

  class ZRText extends Displayable {
    _defaultStyle = DEFAULT_RICH_TEXT_COLOR
    _children = []

    constructor(opts) {
      super();
      this.attr(opts);
    }

    childrenRef() {
      return this._children;
    }

    update() {
      super.update();

      if (this.styleChanged()) {
        this._updateSubTexts();
      }

      for (let i = 0; i < this._children.length; i++){
        const child = this._children[i];
        child.zlevel = this.zlevel;
        child.z = this.z;
        child.z2 = this.z2;
        child.culling = this.culling;
        child.cursor = this.cursor;
        child.invisible = this.invisible;
      }
    }

    getLocalTransform(m) {
      const innerTransformable = this.innerTransformable;
      return innerTransformable
          ? innerTransformable.getLocalTransform(m)
          : super.getLocalTransform(m);
    }

    _updatePlainTexts() {
      const style = this.style;
      const textFont = style.font || DEFAULT_FONT;
      style.padding;

      const text = getStyleText(style);
      const contentBlock = parsePlainText(text, style);
      needDrawBackground(style);
      const bgColorDrawn = !!(style.backgroundColor);
      const textLines = contentBlock.lines;
      const lineHeight = contentBlock.lineHeight;

      const defaultStyle = this._defaultStyle;

      const baseX = style.x || 0;
      const baseY = style.y || 0;
      const textAlign = style.align || defaultStyle.align || 'left';
      const verticalAlign = style.verticalAlign || defaultStyle.verticalAlign || 'top';

      let textX = baseX;
      let textY = adjustTextY(baseY, contentBlock.contentHeight, verticalAlign);

      textY += lineHeight / 2;
      let useDefaultFill = false;
      const textFill = getFill(
        'fill' in style
            ? style.fill
            : (useDefaultFill = true, defaultStyle.fill)
      );
      const textStroke = getStroke(
        'stroke' in style 
              ? style.stroke
              : (!bgColorDrawn && (!defaultStyle.autoStroke || useDefaultFill))
              ? (defaultStyle.stroke)
              : null
      );

      style.textShadowBlur > 0;

      style.width != null
          && (style.overflow === 'truncate' || style.overflow === 'break' || style.overflow === 'breakAll');

      for (let i = 0; i < textLines.length; i++) {
        const el = this._getOrCreateChild(TSpan);
        const subElStyle = el.createStyle();
        el.useStyle(subElStyle);
        subElStyle.text = textLines[i];
        subElStyle.x = textX;
        subElStyle.y = textY;

        if (textAlign) {
          subElStyle.textAlign = textAlign;
        }
        subElStyle.textBaseline = 'middle';
        subElStyle.opacity = style.opacity;
        subElStyle.strokeFirst = true;

        subElStyle.stroke = textStroke;
        subElStyle.fill = textFill;

        subElStyle.font = textFont;
        setSeparateFont(subElStyle, style);

        textY += lineHeight;
      }
    }

    _updateSubTexts() {
      this._childCursor = 0;

      normalizeTextStyle(this.style);
      this.style.rich
          ? console.log('not do this')
          : this._updatePlainTexts();

      this._children.length = this._childCursor;

      this.styleUpdated();
    }

    static makeFont(style) { 
      console.error('方法前面不加static就会报错');
      let font = '';
      if (hasSeparateFont(style)) ;
      return font && trim(font) || style.textFont || style.font;
    }

    _getOrCreateChild(Ctor) {
      let child = this._children[this._childCursor];
      if (!child || !(child instanceof Ctor)) {
        child = new Ctor();
      }
      this._children[this._childCursor++] = child;
      child.__zr = this.__zr;
      child.parent = this;
      return child;
    }

    updateTransform() {
      const innerTransformable = this.innerTransformable;
      if (innerTransformable) ; else {
        super.updateTransform();
      }
    }
  }

  function normalizeTextStyle(style) {
    normalizeStyle(style);
    each(style.rich, normalizeStyle);
    return style;
  }

  const VALID_TEXT_ALIGN = { left: true, right: 1, center: 1 };
  const VALID_TEXT_VERTICAL_ALIGN = { top: 1, bottom: 1, middle: 1 };
  function normalizeStyle(style) {
    if (style) {
      style.font = ZRText.makeFont(style);
      let textAlign = style.align;
      textAlign === 'middle' && (textAlign = 'center');
      style.align = (
        textAlign == null || VALID_TEXT_ALIGN[textAlign]
      ) ? textAlign : 'left'; // center || left

      let verticalAlign = style.verticalAlign;
      verticalAlign === 'center' && (verticalAlign = 'middle');
      style.verticalAlign = (
        verticalAlign == null || VALID_TEXT_VERTICAL_ALIGN[verticalAlign]
      ) ? verticalAlign : 'top'; // middle || top

      const textPadding = style.padding;
      if (textPadding) {
        style.padding = normalizeCssArray(textPadding);
      }
    }
  }

  function hasSeparateFont(style) {
    return style.fontSize != null || style.fontFamily || style.fontWeight;
  }

  function getStyleText(style) {
    let text = style.text;
    text != null && (text += ''); // 转化字符串
    return text;
  }

  function needDrawBackground(style) {
    return !!(
      style.backgroundColor
      || style.lineHeight
      || (style.borderWidth && style.borderColor)
    );
  }

  function getFill(fill) {
    return (fill == null || fill === 'none')
        ? null
        : (fill.image || fill.colorStops)
        ? '#000'
        : fill;
  }

  function getStroke(stroke, lineWidth) {
    return (stroke == null || lineWidth <= 0 || stroke === 'transparent' || stroke === 'none') 
        ? null
        : (stroke.image || stroke.colorStops)
        ? '#000'
        : stroke;
  }

  const FONT_PARTS = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily'];
  function setSeparateFont(targetStyle, sourceStyle) {
    for (let i = 0; i < FONT_PARTS.length; i++) {
      const fontProp = FONT_PARTS[i];
      const val = sourceStyle[fontProp];
      if (val != null) {
        targetStyle[fontProp] = val;
      }
    }
  }

  class CompoundPath extends Path {
    _updatePathDirty() {
      const paths = this.shape.paths;
      let dirtyPath = this.shapeChanged();
      for (let i = 0; i < paths.length; i++) {
        // Mark as dirty if any subpath is dirty
        dirtyPath = dirtyPath || paths[i].shapeChanged();
      }
      if (dirtyPath) {
        this.dirtyShape();
      }
    }

    // hook
    beforeBrush() {
      this._updatePathDirty();
      const paths = this.shape.paths || [];
      const scale = this.getGlobalScale();
      for (let i = 0; i < paths.length; i++) {
        if (!paths[i].path) {
          paths[i].createPathProxy();
        }
        paths[i].path.setScale(scale[0], scale[1], paths[i].segmentIgnoreThreshold);
      }
    }

    buildPath(ctx, shape) {
      const paths = shape.paths || [];
      for (let i = 0; i < paths.length; i++) {
        paths[i].buildPath(ctx, paths[i].shape, true);
      }
    }

    afterBrush() {
      const paths = this.shape.paths || [];
      for (let i = 0; i < paths.length; i++) {
        paths[i].pathUpdated();
      }
    }
  }

  class Group extends Element {
    isGroup = true
    _children = []

    constructor(opts) {
      super();

      this.attr(opts);
    }

    add(child) {
      if (child) {
        if (child !== this && child.parent !== this) {
          this._children.push(child);
          this._doAdd(child);
        }
      }

      return this;
    }

    _doAdd(child) {
      child.parent = this;

      const zr = this.__zr;
      zr && zr.refresh();
    }

    childrenRef() {
      return this._children;
    }
  }

  Group.prototype.type = 'group';

  class Gradient {
    colorStops

    constructor(colorStops) {
      this.colorStops = colorStops || [];
    }

    addColorStop(offset, color) {
      this.colorStops.push({
        offset,
        color
      });
    }
  }

  class LinearGradient extends Gradient {
    constructor(x, y, x2, y2, colorStops, globalCoord) {
      super(colorStops);
      this.x = x == null ? 0 : x;
      this.y = y == null ? 0 : y;
      this.x2 = x2 == null ? 1 : x2;
      this.y2 = y2 == null ? 0 : y2;

      this.type = 'linear';

      this.global = globalCoord || false;
    }
  }

  function parseInt10(val) {
    return parseInt(val, 10);
  }

  function getSize(root, whIdx, opts) {
    const wh = ['width', 'height'][whIdx];
    const cwh = ['clientWidth', 'clientHeight'][whIdx];
    const plt = ['paddingLeft', 'paddingTop'][whIdx];
    const prb = ['paddingRight', 'paddingBottom'][whIdx];

    // IE8不支持getComputedStyle，但它使用VML.
    const stl = document.defaultView.getComputedStyle(root);

    const root_cwh = root[cwh]; // 1000 没有wh
    const stl_wh = parseInt10(stl[wh]); // '1000px' 没有cwh
    const root_s_wh = parseInt10(root.style[wh]); // '1000px' 没有cwh

    return ((root_cwh || stl_wh || root_s_wh) - (parseInt10(stl[plt]) || 0) - (parseInt10(stl[prb]) || 0)) || 0;
  }

  function isSafeNum(num) {
    // NaN、Infinity、undefined、'xx'
    return isFinite(num);
  }

  function createLinearGradient(ctx, obj, rect) {
    let x = obj.x == null ? 0 : obj.x;
    let x2 = obj.x2 == null ? 1 : obj.x2;
    let y = obj.y == null ? 0 : obj.y;
    let y2 = obj.y2 == null ? 0 : obj.y2;

    if (!obj.global) {
      x = x * rect.width + rect.x;
      x2 = x2 * rect.width + rect.x;
      y = y * rect.height + rect.y;
      y2 = y2 * rect.height + rect.y;
    }

    x = isSafeNum(x) ? x : 0;
    x2 = isSafeNum(x2) ? x2 : 1;
    y = isSafeNum(y) ? y : 0;
    y2 = isSafeNum(y2) ? y2 : 0;

    const canvasGradient = ctx.createLinearGradient(x, y, x2, y2);

    return canvasGradient;
  }

  function getCanvasGradient(ctx, obj, rect) {
    const canvasGradient = obj.type === 'radial'
          ? console.log('not do this')
          : createLinearGradient(ctx, obj, rect);

    const colorStops = obj.colorStops;
    for (let i = 0; i < colorStops.length; i++) {
      canvasGradient.addColorStop(
        colorStops[i].offset, colorStops[i].color
      );
    }
    return canvasGradient;
  }

  function createDom(id, painter, dpr) {
    const newDom = platformApi.createCanvas();
    const width = painter.getWidth();
    const height = painter.getHeight();

    const style = newDom.style;
    if (style) {
      style.position = 'absolute';
      style.left = '0';
      style.top = '0';
      style.width = width + 'px';
      style.height = height + 'px';

      newDom.setAttribute('data-zr-dom-id', id);
    }

    newDom.width = width * dpr;
    newDom.height = height * dpr;

    return newDom;
  }

  class Layer extends Eventful {
    id
    dom
    painter
    dpr = 1
    __dirty = true

    __startIndex = 0
    __endIndex = 0

    zlevel = 0

    __builtin__

    __used = false

    virtual = false // 虚拟layer不会被塞进dom中

    ctx

    constructor(id, painter, dpr = undefined) {
      super();

      let dom;
      dpr = dpr || devicePixelRatio;
      if (typeof id === 'string') {
        dom = createDom(id, painter, dpr);
      }
      this.id = id;
      this.dom = dom;

      const domStyle = dom.style;
      if (domStyle) {
        disableUserSelect(dom);
        dom.onselectstart = () => false;
        domStyle.padding = '0';
        domStyle.margin = '0';
        domStyle.borderWidth = '0';
      }

      this.painter = painter;
      this.dpr = dpr;
    }

    initContext() {
      this.ctx = this.dom.getContext('2d');
      this.ctx.dpr = this.dpr;
    }

    clear(clearAll, clearColor, repaintRects) {
      const ctx = this.ctx;
      const dom = this.dom;
      const width = dom.width;
      const height = dom.height;
      function doClear(x, y, width, height) {
        ctx.clearRect(x, y, width, height);
      }

      if (!repaintRects) {
        doClear(0, 0, width, height);
      }
    }

    afterBrush() {
      this.__prevStartIndex = this.__startIndex;
      this.__prevEndIndex = this.__endIndex;
    }
  }

  function normallizeLineDash(lineType, lineWidth) {
    if (!lineType || lineType === 'solid' || !(lineWidth > 0)) {
      return null;
    }
    return lineType === 'dashed'
          ? [4 * lineWidth, 2 * lineWidth]
          : lineType === 'dotted'
                  ? [lineWidth]
                  : isNumber(lineType)
                        ? [lineType] : isArray(lineType) ? lineType : null;
  }

  function getLineDash(el) {
    const style = el.style;

    let lineDash = style.lineDash && style.lineWidth > 0 && normallizeLineDash(style.lineDash, style.lineWidth);
    let lineDashOffset = style.lineDashOffset;

    return [lineDash, lineDashOffset];
  }

  const DRAW_TYPE_PATH = 1;
  const DRAW_TYPE_TEXT = 3;

  const pathProxyForDraw = new PathProxy(true);

  const DEFAULT_COMMON_STYLE = {
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000',
    opacity: 1,
    blend: 'source-over'
  };

  const SHADOW_NUMBER_PROPS = ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];
  const STROKE_PROPS = [
    ['lineCap', 'butt'],['lineJoin', 'miter'],['miterLimit', 10]
  ];

  function styleHasStroke(style) {
    const stroke = style.stroke;
    return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0));
  }

  function styleHasFill(style) {
    const fill = style.fill;
    return fill != null && fill !== 'none';
  }

  function isTransformChanged(m0, m1) {
    if (m0 && m1) {
      return m0[0] !== m1[0] 
          || m0[1] !== m1[1]
          || m0[2] !== m1[2]
          || m0[3] !== m1[3]
          || m0[4] !== m1[4]
          || m0[5] !== m1[5];
    } else if (!m0 && !m1) {
      return false;
    }

    return true;
  }

  function flushPathDrawn(ctx, scope) {
    scope.batchFill && ctx.fill();
    scope.batchStroke && ctx.stroke();
    scope.batchFill = '';
    scope.batchStroke = '';
  }

  function setContextTransform(ctx, el) {
    const m = el.transform;
    const dpr = ctx.dpr || 1;
    // 之后的图形都沿用此种变换
    // 水平缩放、水平倾斜、垂直倾斜、垂直缩放、水平平移、垂直平移
    if (m) {
      ctx.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function getStyle(el, inHover) {
    return inHover ? (el.__hoverStyle || el.style) : el.style;
  }

  function isValidStrokeFillStyle(strokeOrFill) {
    return typeof strokeOrFill === 'string' && strokeOrFill !== 'none';
  }

  function doStrokePath(ctx, style) {
    ctx.stroke();
  }

  function doFillPath(ctx, style) {
    ctx.fill();
  }

  function bindCommonProps(ctx, style, prevStyle, forceSetAll, scope) {
    let styleChanged = false;
    if (forceSetAll || style.opacity !== prevStyle.opacity) {
      flushPathDrawn(ctx, scope);
      styleChanged = true;

      const opacity = Math.max(Math.min(style.opacity, 1), 0);
      ctx.globalAlpha = isNaN(opacity) ? DEFAULT_COMMON_STYLE.opacity : opacity;
    }

    if (forceSetAll || style.blend !== prevStyle.blend) {
      ctx.globalCompositeOperation = style.blend || DEFAULT_COMMON_STYLE.blend;
    }
    for (let i = 0; i < SHADOW_NUMBER_PROPS.length; i ++) {
      const propName = SHADOW_NUMBER_PROPS[i];
      if (forceSetAll || style[propName] !== prevStyle[propName]) {
        ctx[propName] = ctx.dpr * (style[propName] || 0);
      }
    }
    if (forceSetAll || style.shadowColor !== prevStyle.shadowColor) {
      ctx.shadowColor = style.shadowColor || DEFAULT_COMMON_STYLE.shadowColor;
    }
    return styleChanged;
  }

  function bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetAll, scope) {
    const style = getStyle(el, scope.inHover);
    const prevStyle = forceSetAll ? null : (prevEl && getStyle(prevEl, scope.inHover) || {});

    let styleChanged = bindCommonProps(ctx, style, prevStyle, forceSetAll, scope);

    if (forceSetAll || style.fill !== prevStyle.fill) {
      isValidStrokeFillStyle(style.fill) && (ctx.fillStyle = style.fill);
    }
    if (forceSetAll || style.stroke !== prevStyle.stroke) { 
      isValidStrokeFillStyle(style.stroke) && (ctx.strokeStyle = style.stroke);
    }
    if (forceSetAll || style.opacity !== prevStyle.opacity) {
      ctx.globalAlpha = style.opacity == null ? 1 : style.opacity;
    }
    if (el.hasStroke()) {
      const lineWidth = style.lineWidth;
      const newLineWidth = lineWidth / (
          (style.strokeNoScale && el.getLineScale) ? el.getLineScale() : 1
      );
      if (ctx.lineWidth !== newLineWidth) {
          ctx.lineWidth = newLineWidth;
      }
  }
    for (let i = 0; i < STROKE_PROPS.length; i ++) {
      const prop = STROKE_PROPS[i];
      const propName = prop[0];
      if (forceSetAll || style[propName] !== prevStyle[propName]) {
        ctx[propName] = style[propName] || prop[1];
      }
    }

    return styleChanged;
  }

  function brush(ctx, el, scope, isLast) {
    const m = el.transform;
    let forceSetTransform = false;
    let forceSetStyle = false;
    // 开始 brush
    el.beforeBrush && el.beforeBrush();
    el.innerBeforeBrush();

    const prevEl = scope.prevEl;
    if (!prevEl) {
      forceSetStyle = forceSetTransform = true;
    }

    if (forceSetTransform || isTransformChanged(m, prevEl.transform)) {
      flushPathDrawn(ctx, scope);
      setContextTransform(ctx, el);
    }

    let canBatchPath = el instanceof Path && el.autoBatch && canPathBatch(el.style);

    const style = getStyle(el, scope.inHover);
    if (el instanceof Path) {
      if (scope.lastDrawType !== DRAW_TYPE_PATH) {
        forceSetStyle = true;
        scope.lastDrawType = DRAW_TYPE_PATH;
      }

      bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetStyle, scope);
      if (!canBatchPath) {
        ctx.beginPath();
      }
      brushPath(ctx, el, style, canBatchPath);
    } else {
      if (el instanceof TSpan) {
        if (scope.lastDrawType !== DRAW_TYPE_TEXT) {
          forceSetStyle = true;
          scope.lastDrawType = DRAW_TYPE_TEXT;
        }

        bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetStyle, scope);
        brushText(ctx, el, style);
      }
    }

    el.innerAfterBrush();
    el.afterBrush && el.afterBrush();

    scope.prevEl = el;

    el.__dirty = 0;
    el._isRendered = true;
  }

  // draw text element
  function brushText(ctx, el, style) {
    let text = style.text;

    text != null && (text += '');

    if (text) {
      ctx.font = style.font || DEFAULT_FONT;
      ctx.textAlign = style.textAlign;
      ctx.textBaseline = style.textBaseline;
      if (ctx.setLineDash && style.lineDash) ;

      console.error('这个strokeFirst先后重要吗');
      if (style.strokeFirst) {
        if (styleHasStroke(style)) {
          ctx.strokeText(text, style.x, style.y);
        }
        if (styleHasFill(style)) {
          ctx.fillText(text, style.x, style.y);
        }
      } else {
        if (styleHasFill(style)) {
          ctx.fillText(text, style.x, style.y);
        }
        if (styleHasStroke(style)) {
          ctx.strokeText(text, style.x, style.y);
        }
      }
    }
  }

  function brushPath(ctx, el, style, inBatch) {
    let hasStroke = styleHasStroke(style);
    let hasFill = styleHasFill(style);

    const strokePercent = style.strokePercent;
    const strokePart = strokePercent < 1;

    const firstDraw = !el.path;

    if ((!el.silent || strokePart) && firstDraw) {
      el.createPathProxy();
    }

    const path = el.path || pathProxyForDraw;
    const dirtyFlag = el.__dirty;
    if (!inBatch) {
      const fill = style.fill;
      const stroke = style.stroke;

      const hasFillGradient = hasFill && !!fill.colorStops;
      const hasStrokeGradient = hasStroke && !!stroke.colorStops;

      let fillGradient;
      let rect;
      if (hasFillGradient || hasStrokeGradient) {
        rect = el.getBoundingRect();
      }

      if (hasFillGradient) {
        fillGradient = dirtyFlag 
            ? getCanvasGradient(ctx, fill, rect)
            : console.log('not do this');
      }

      if (hasFillGradient) {
        ctx.fillStyle = fillGradient;
      }
    }

    const scale = el.getGlobalScale();
    path.setScale(scale[0], scale[1], el.segmentIgnoreThreshold);

    let needsRebuild = true;
    if (firstDraw || (dirtyFlag & SHAPE_CHANGED_BIT)) {
      path.setDPR(ctx.dpr);
      if (strokePart) ; else {
        path.setContext(ctx);
        needsRebuild = false;
      }
      path.reset();

      el.buildPath(path, el.shape, inBatch);
      path.toStatic();

      el.pathUpdated();
    }

    if (needsRebuild) {
      path.rebuildPath(ctx, strokePart ? strokePercent : 1);
    }

    let lineDash;
    let lineDashOffset;
    if (ctx.setLineDash && style.lineDash) {
      [lineDash, lineDashOffset] = getLineDash(el);
    }
    if (lineDash) {
      ctx.setLineDash(lineDash);
      ctx.lineDashOffset = lineDashOffset;
    }

    // stroke || fill 放最后一步 (ctx.stroke() || ctx.fill())
    if (!inBatch) {
      if (style.strokeFirst) ; else {
        if (hasFill) {
          doFillPath(ctx);
        }
        if (hasStroke) {
          doStrokePath(ctx);
        }
      }
    }

    if (lineDash) {
      ctx.setLineDash([]);
    }
  }

  function createRoot(width, height) {
      const domRoot = document.createElement('div');

      domRoot.style.cssText = [
        'position: relative',
        'width:' + width + 'px',
        'height:' + height + 'px',
        'padding: 0',
        'margin: 0',
        'border-width: 0'
      ].join(';') + ';';

      return domRoot;
  }
  class CanvasPainter {
    _needsManuallyCompositing = false
    
    _layers = {} // key is zlevel

    constructor(root, storage, opts, id) {
      this.type = "canvas";

      this._zlevelList = [];
      this._redrawId = 0;

      this._hoverLayer = undefined;
      this.storage = storage;
      this.root = root;

      this._preDisplayList = [];

      const singleCanvas = !root.nodeName 
        || root.nodeName.toUpperCase() === 'CANVAS';

      this._singleCanvas = singleCanvas;

      if (!singleCanvas) {
        this._width = getSize(root, 0);
        this._height = getSize(root, 1);

        const domRoot = this._domRoot = createRoot(
          this._width, this._height
        );
        root.appendChild(domRoot);
      }
    }

    getType() {
      return 'canvas';
    }

    // 刷新
    refresh() {
      const list = this.storage.getDisplayList(true);
      const prevList = this._preDisplayList;

      const zlevelList = this._zlevelList;
      this._redrawId = Math.random();

      this._paintList(list, prevList, undefined, this._redrawId);

      for (let i = 0; i < zlevelList.length; i ++) {
        const z = zlevelList[i];
        this._layers[z];
      }

      return this;
    }

    refreshHover() {
      this._paintHoverList(this.storage.getDisplayList(false));
    }

    _paintHoverList(list) {
      let len = list.length;
      let hoverLayer = this._hoverLayer;
      hoverLayer && hoverLayer.clear();

      if (!len) {
        return;
      }
    }

    _paintList(list, prevList, paintAll, redrawId) {
      if (this._redrawId !== redrawId) {
        return;
      }

      paintAll = paintAll || false;

      this._updateLayerStatus(list);

      const {finished} = this._doPaintList(list, prevList, paintAll);

      if (!finished) ; else {
        this.eachLayer(layer => {
          layer.afterBrush && layer.afterBrush();
        });
      }
    }
    
    _updateLayerStatus(list) {
      function updatePrevLayer(idx) {
        if (prevLayer) {
          if (prevLayer.__endIndex !== idx) {
            prevLayer.__dirty = true;
          }
          prevLayer.__endIndex = idx;
        }
      }

      let prevLayer = null;
      let i;

      for (i = 0; i < list.length; i++) {
        const el = list[i];
        const zlevel = el.zlevel;
        let layer = this.getLayer(zlevel + 0, false);

        if (layer !== prevLayer) {
          layer.__used = true;
          layer.__startIndex = i;
          if (!layer.incremental) {
            layer.__drawIndex = i;
          } else {
            layer.__drawIndex = -1;
          }
          // updatePrevLayer(i);
          prevLayer = layer;
        }

        if ((el.__dirty & REDRAW_BIT) && !el.__inHover) {
          layer.__dirty = true;
        }
      }
      updatePrevLayer(i);
    }

    getLayer(zlevel, virtual = undefined) {
      let layer = this._layers[zlevel];
      if (!layer) {
        // 创建一个新的layer
        layer = new Layer('zr_' + zlevel, this, this.dpr);
        layer.zlevel = zlevel;
        layer.__builtin__ = true;

        this.insertLayer(zlevel, layer);

        layer.initContext();
      }

      return layer;
    }

    insertLayer(zlevel, layer) {
      const layersMap = this._layers;
      const zlevelList = this._zlevelList;
      zlevelList.length;
      const domRoot = this._domRoot;
      let i = -1;

      zlevelList.splice(i + 1, 0, zlevel);

      layersMap[zlevel] = layer;

      // Virtual layer will not directly show on the screen.
      // (It can be a WebGL layer and assigned to a ZRImage element)
      // But it still under management of zrender.
      if (!layer.virtual) {
        {
          if (domRoot.firstChild) ; else {
            domRoot.appendChild(layer.dom);
          }
        }
      }
      console.error('下面的啥意思');
      layer.painter || (layer.painter = this);
    }

    eachLayer(cb, context) {
      const zlevelList = this._zlevelList;
      for (let i = 0; i < zlevelList.length; i++) {
        const z = zlevelList[i];
        cb.call(context, this._layers[z], z);
      }
    }
    eachBuiltinLayer(cb, context) {
      const zlevelList = this._zlevelList;
      for (let i = 0; i < zlevelList.length; i++) {
        const z = zlevelList[i];
        // _layers什么时候赋值的
        const layer = this._layers[z];
        if (layer.__builtin__) {
          cb.call(context, layer, z);
        }
      }
    }

    _doPaintList(list, prevList, paintAll = undefined) {
      const layerList = [];
      for (let zi = 0; zi < this._zlevelList.length; zi++) {
        const zlevel = this._zlevelList[zi];
        const layer = this._layers[zlevel];
        if (layer.__builtin__ 
          && layer !== this._hoverLayer
          && (layer.__dirty || paintAll)) {
            layerList.push(layer);
          }
      }

      let finished = true;
      
      for (let k = 0; k < layerList.length; k++) {
        const layer = layerList[k];
        const ctx = layer.ctx;

        const repaintRects = false;

        let start = paintAll ? layer.__startIndex : layer.__drawIndex;

        const clearColor = layer.zlevel === this._zlevelList[0] ? this._backgroundColor : null;

        if (layer.__startIndex === layer.__endIndex) ; else if (start === layer.__startIndex) {
          const firstEl = list[start];
          if (!firstEl.incremental || !firstEl.notClear || paintAll) {
            layer.clear(false, clearColor, repaintRects);
          }
        }

        let i;
        const repaint = (repaintRect) => {
          const scope = {
            inHover: false,
            allClipped: false,
            prevEl: null,
            viewWidth: this._width,
            viewHeight: this._height
          };
          for (i = start; i < layer.__endIndex; i ++) {
            const el = list[i];

            this._doPaintEl(el, layer, false, repaintRect, scope, i === layer.__endIndex - 1);
          }
        };

        {
          ctx.save();
          repaint();
          ctx.restore();
        }

        // layer.__drawIndex = i;
      }

      return {
        finished
      }
    }

    _doPaintEl(el, currentLayer, useDirtyRect, repaintRect, scope, isLast) {
      const ctx = currentLayer.ctx;
      brush(ctx, el, scope);
    }

    getViewportRoot() {
      return this._domRoot;
    }

    getWidth() {
      return this._width;
    }

    getHeight() {
      return this._height;
    }
  }

  class SVGPainter {
    constructor() {
      this.type = 'svg';
      this.root = null;
    }
  }

  registerPainter('canvas', CanvasPainter);
  registerPainter('svg', SVGPainter);

  exports.BezierCurve = BezierCurve;
  exports.BezierCurveShape = BezierCurveShape;
  exports.Circle = Circle;
  exports.CircleShape = CircleShape;
  exports.CompoundPath = CompoundPath;
  exports.Group = Group;
  exports.Line = Line;
  exports.LineShape = LineShape;
  exports.LinearGradient = LinearGradient;
  exports.Path = Path;
  exports.Polygon = Polygon;
  exports.PolygonShape = PolygonShape;
  exports.Polyline = Polyline;
  exports.PolylineShape = PolylineShape;
  exports.Text = ZRText;
  exports.init = init;
  exports.path = path;
  exports.registerPainter = registerPainter;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=zrender.js.map

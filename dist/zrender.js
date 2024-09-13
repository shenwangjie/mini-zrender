(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.zrender = {}));
})(this, (function (exports) { 'use strict';

  const protoKey = '__proto__';

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
  } else if (env.hasGlobalWindow || 'Deno' in window) {
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
    constructor() {
      this._$handlers = null;
    }

    trigger(eventType, ...args) {
      if (!this._$handlers) {
        return this;
      }
      
      return this;
    }
  }

  class HandlerDomProxy extends Eventful {
    constructor(dom, painterRoot) {
      super();
      this.dom = dom;
      this.painterRoot = painterRoot;
    }
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
      /**
      * Proxy of event. can be Dom, WebGLSurface, etc.
      */
      this.proxy = null;
      console.error('不是很理解');
    }
  }

  function getTime() {
    return new Date().getTime()
  }

  class Animation extends Eventful {

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
      // let clip = this.

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
    
    constructor() {
      this.roots = [];
      this._displayList = [];
      this._displayListLen = 0;
    }
    
    // 拿到一串需要被渲染的elements
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
      
      displayList.length = this._displayListLen;
      sort(displayList);
    }
  }

  const painterCtors = {};
  let instances = {};

  class ZRender {

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

      getTime();
      if (this._needsRefresh) {
        triggerRendered = true;
        this.refreshImmediately(fromInside);
      }

      if (this._needsRefreshHover) {
        triggerRendered = true;
        this.refreshHoverImmediately();
      }

      getTime();
      if (triggerRendered) {
        this.trigger('renderd');
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

  class Element {
    constructor(props = null) {
      this._init(props);
    }

    attrKV(key, value) {
      if (key === 'textConfig') ; else if (key === 'textContent') ; else if (key === 'clipPath') ; else if (key === 'extra') ; else {
        this[key] = value;
      }
    }

    markRedraw() {
      this.__dirty |= REDRAW_BIT; // 按位或 如3|5 = 7 0011 | 0101 = 0111
      const zr = this.__zr;
      if (zr) {
        console.info('next...');
      }
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

  const STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));

  const DEFAULT_COMMON_STYLE = {
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000',
    opacity: 1,
    blend: 'source-over'
  };

  class Displayable extends Element {
    constructor(props = null) {
      super(props);
    }

    _init(props = null) {

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
  }, DEFAULT_COMMON_STYLE);

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
        this.useStyle({});
      }
    }

    createStyle(obj = null) {
      return createObject(DEFAULT_PATH_STYLE, obj)
    }
  }

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
  }

  class CanvasPainter {
    
    constructor(root, storage, opts, id) {
      this.type = "canvas";

      this._zlevelList = [];
      this._redrawId = 0;

      this._hoverLayer = undefined;
      this.storage = storage;
      this.root = root;

      this._preDisplayList = [];
    }

    getType() {
      return 'canvas';
    }

    // 刷新
    refresh() {
      const list = this.storage.getDisplayList(true);
      const prevList = this._preDisplayList;

      this._redrawId = Math.random();

      this._paintList(list, prevList, undefined, this._redrawId);

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
          
        });
      }
    }
    // 等于啥都没干
    _updateLayerStatus(list) {
      this.eachBuiltinLayer(function (layer, z) {

      });
      let i;

      for (i = 0; i < list.length; i++) {

      }

      this.eachBuiltinLayer(function (layer, z) {

      });
    }

    eachLayer(cb, content) {
      const zlevelList = this._zlevelList;
      for (let i = 0; i < zlevelList.length; i++) {

      }
    }
    eachBuiltinLayer(cb, context) {
      const zlevelList = this._zlevelList;
      for (let i = 0; i < zlevelList.length; i++) {
        
      }
    }

    _doPaintList(list, prevList, paintAll = undefined) {
      for (let zi = 0; zi < this._zlevelList.length; zi++) {
        
      }

      let finished = true;

      return {
        finished
      }
    }

    getViewportRoot() {
      return this._domRoot;
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
  exports.init = init;
  exports.registerPainter = registerPainter;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=zrender.js.map

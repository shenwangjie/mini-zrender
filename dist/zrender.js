(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.zrender = {}));
})(this, (function (exports) { 'use strict';

  const protoKey = '__proto__';

  const objToString = Object.prototype.toString;

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
      animator.getClip();
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
      // el.beforeUpdate();
      // el.update();
      // el.afterUpdate();

      // const userSetClipPath = el.getClipPath();
      if (el.childrenRef) ; else {
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

  class Transformable {
    updateTransform() {
      return;
    }

    getGlobalScale(out) {
      const m = this.transform;
      out = out || [];
      if (!m) {
        out[0] = 1;
        out[1] = 1;
        return out;
      }
    }
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

  const VALUE_TYPE_NUMBER = 0;
  const VALUE_TYPE_UNKOWN = 6;

  function interpolateNumber(p0, p1, percent) {
    return (p1 - p0) * percent + p0;
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

      if (isNumber(rawValue) && !eqNaN(rawValue)) {
        valType = VALUE_TYPE_NUMBER;
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
      kfs.length;
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
      const value = interpolateNumber(frame[valueKey], nextFrame[valueKey], w);
      target[propName] = value;
    }
  }

  class Element {
    animators = []

    constructor(props = null) {
      this._init(props);
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

    static initDefaultProps = (function () {
      const dispProto = Displayable.prototype;
      dispProto.zlevel = 0;

      dispProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT;
    })()
  }

  const CMD = {
    M: 1,
    L: 2,
    C: 3,
    Q: 4,
    A: 5,
    Z: 6,
    R: 7
  };

  const mathAbs = Math.abs;

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
    }

    setDPR(dpr) {
      this.dpr = dpr;
    }

    setContext(ctx) {
      this._ctx = ctx;
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

    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
      this.addData(CMD.C, x1, y1, x2, y2, x3, y3);
      if (this._ctx) {
        this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      }
      this._xi = x3;
      this._yi = y3;
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
        }
      }
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

  const platformApi = {
    createCanvas() {
      return typeof document !== 'undefined' 
      && document.createElement('canvas');
    },

    measureText: (function() {
      return (text, font = undefined) => {
        
      }
    })(),
  };

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
    if (m) ; else {
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
    }

    el.innerAfterBrush();
    el.afterBrush && el.afterBrush();

    scope.prevEl = el;

    el.__dirty = 0;
    el._isRendered = true;
  }

  function brushPath(ctx, el, style, inBatch) {
    let hasStroke = styleHasStroke(style);
    styleHasFill(style);

    const strokePercent = style.strokePercent;
    const strokePart = strokePercent < 1;

    const firstDraw = !el.path;

    if ((!el.silent || strokePart) && firstDraw) {
      el.createPathProxy();
    }

    const path = el.path || pathProxyForDraw;
    const dirtyFlag = el.__dirty;
    if (!inBatch) {
      style.fill;
      style.stroke;
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
  exports.Polyline = Polyline;
  exports.PolylineShape = PolylineShape;
  exports.init = init;
  exports.registerPainter = registerPainter;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=zrender.js.map

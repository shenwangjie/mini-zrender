
export default class Eventful {
  _$handlers
  _$eventProcessor

  constructor() {
    this._$handlers = null
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

    const eventProcessor = this._$eventProcessor;
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
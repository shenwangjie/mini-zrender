import Eventful from '../core/Eventful'
import { devicePixelRatio } from '../config'
import { platformApi } from '../core/platform'
import * as util from '../core/util'

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
      util.disableUserSelect(dom);
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

export default Layer;
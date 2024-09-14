import Eventful from '../core/Eventful'
import { devicePixelRatio } from '../config'
import { platformApi } from '../core/platform'

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

  // thinking
  newDom.width = width * dpr;
  newDom.height = height * dpr;

  return newDom;
}

class Layer extends Eventful {
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
}

export default Layer;
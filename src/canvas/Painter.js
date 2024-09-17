import Storage from "../Storage";
import { getSize } from './helper';
import Layer from "./Layer";
import { REDRAW_BIT } from '../graphic/constants'

const EL_AFTER_INCREMENTAL_INC = 0.01;

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

function isLayerValid(layer) {
  if (!layer) return false;

  if (layer.__builtin__) return true;
}
export default class CanvasPainter {
  _needsManuallyCompositing = false

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
      this._width = getSize(root, 0, opts);
      this._height = getSize(root, 1, opts);

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

    this._redrawId = Math.random();

    this._paintList(list, prevList, undefined, this._redrawId);

    for (let i = 0; i < zlevelList.length; i ++) {
      const z = zlevelList[i];
      const layer = this._layers[z];
    }

    return this;
  }

  refreshHover() {
    this._paintHoverList(this.storage.getDisplayList(false))
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

    this._updateLayerStatus(list)

    const {finished} = this._doPaintList(list, prevList, paintAll);

    if (!finished) {

    } else {
      this.eachLayer(layer => {
        layer.afterBrush && layer.afterBrush();
      })
    }
  }
  
  _updateLayerStatus(list) {
    this.eachBuiltinLayer(function (layer, z) {

    });

    function updatePrevLayer(idx) {
      if (prevLayer) {
        if (prevLayer.__endIndex !== idx) {
          prevLayer.__dirty = true;
        }
        prevLayer.__endIndex = idx;
      }
    }

    let prevLayer = null;
    let incrementalLayerCount = 0;
    let prevZlevel;
    let i;

    for (i = 0; i < list.length; i++) {
      const el = list[i];
      const zlevel = el.zlevel;
      let layer;

      if (prevZlevel !== zlevel) {
        prevZlevel = zlevel;
        incrementalLayerCount = 0;
      }

      if (el.incremental) {

      } else {
        layer = this.getLayer(
          zlevel + (incrementalLayerCount > 0 ? EL_AFTER_INCREMENTAL_INC : 0),
          this._needsManuallyCompositing
        )
      }

      if (layer !== prevLayer) {
        layer.__used = true;
        layer.__startIndex = i;
        if (!layer.incremental) {
          layer.__drawIndex = i;
        } else {
          // 标记需要被更新
          layer.__drawIndex = -1;
        }
        updatePrevLayer(i);
        prevLayer = layer;
      }

      if ((el.__dirty & REDRAW_BIT) && !el.__inHover) {
        layer.__dirty = true;
      }
    }

    updatePrevLayer(i)

    this.eachBuiltinLayer(function (layer, z) {

    })
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
    const len = zlevelList.length;
    const domRoot = this._domRoot;
    let prevLayer = null;
    let i = -1;

    zlevelList.splice(i + 1, 0, zlevel);

    layersMap[zlevel] = layer;

    // Virtual layer will not directly show on the screen.
    // (It can be a WebGL layer and assigned to a ZRImage element)
    // But it still under management of zrender.
    if (!layer.virtual) {
      if (prevLayer) {

      } else {
        if (domRoot.firstChild) {

        } else {
          domRoot.appendChild(layer.dom);
        }
      }
    }
    console.error('下面的啥意思')
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

      if (layer.__startIndex === layer.__endIndex) {

      } else if (start === layer.__startIndex) {
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
        }
        for (i = start; i < layer.__endIndex; i ++) {
          const el = list[i];

          this._doPaintEl(el, layer, false, repaintRect, scope, i === layer.__endIndex - 1);
        }
      }

      if (repaintRects) {

      } else {
        ctx.save();
        repaint();
        ctx.restore();
      }

      layer.__drawIndex = i;
    }

    return {
      finished
    }
  }

  _doPaintEl(el, currentLayer, useDirtyRect, repaintRect, scope, isLast) {
    const ctx = currentLayer.ctx;
    brush(ctx, el, scope, isLast);
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
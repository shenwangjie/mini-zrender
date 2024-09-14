import Storage from "../Storage";
import { getSize } from './helper';
import Layer from "./Layer";

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
        
      })
    }
  }
  
  _updateLayerStatus(list) {
    this.eachBuiltinLayer(function (layer, z) {

    });

    function updatePrevLayer(idx) {
      if (prevLayer) {

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
    const layerList = [];
    for (let zi = 0; zi < this._zlevelList.length; zi++) {
      
    }

    let finished = true;
    
    for (let k = 0; k < layerList.length; k++) {

    }

    return {
      finished
    }
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
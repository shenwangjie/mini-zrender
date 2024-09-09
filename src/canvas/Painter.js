import Storage from "../Storage";

export default class CanvasPainter {
  
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
  // 等于啥都没干
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

    }

    updatePrevLayer(i)

    this.eachBuiltinLayer(function (layer, z) {

    })
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
}

import timsort from './core/timesort'
export default class Storage {
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
      this.updateDisplayList()
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
    timsort(displayList, null);
  }

  _updateAndAddDisplayable(el) {
    // el.beforeUpdate();
    // el.update();
    // el.afterUpdate();

    // const userSetClipPath = el.getClipPath();
    if (el.childrenRef) { // Group
      const children = el.childrenRef();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (el.__dirty) {
          child.__dirty |= REDRAW_BIT;
        }

        this._updateAndAddDisplayable(child)
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
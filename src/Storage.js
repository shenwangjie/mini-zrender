
import timsort from './core/timesort'
export default class Storage {
  
  constructor() {
    this.roots = []
    this._displayList = []
    this._displayListLen = 0
  }
  
  // 拿到一串需要被渲染的elements
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
    
    displayList.length = this._displayListLen;
    timsort(displayList, null);
  }
}
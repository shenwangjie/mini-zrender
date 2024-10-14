import Element from '../Element';

class Group extends Element {
  isGroup = true
  _children = []

  constructor(opts) {
    super();

    this.attr(opts);
  }

  add(child) {
    if (child) {
      if (child !== this && child.parent !== this) {
        this._children.push(child);
        this._doAdd(child);
      }
    }

    return this;
  }

  _doAdd(child) {
    child.parent = this;

    const zr = this.__zr;
    zr && zr.refresh();
  }

  childrenRef() {
    return this._children;
  }
}

Group.prototype.type = 'group';

export default Group;
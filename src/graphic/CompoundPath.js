import Path from "./Path";

export default class CompoundPath extends Path {
  _updatePathDirty() {
    const paths = this.shape.paths;
    let dirtyPath = this.shapeChanged();
    for (let i = 0; i < paths.length; i++) {
      // Mark as dirty if any subpath is dirty
      dirtyPath = dirtyPath || paths[i].shapeChanged();
    }
    if (dirtyPath) {
      this.dirtyShape();
    }
  }

  // hook
  beforeBrush() {
    this._updatePathDirty();
    const paths = this.shape.paths || [];
    const scale = this.getGlobalScale();
    for (let i = 0; i < paths.length; i++) {
      if (!paths[i].path) {
        paths[i].createPathProxy();
      }
      paths[i].path.setScale(scale[0], scale[1], paths[i].segmentIgnoreThreshold);
    }
  }

  buildPath(ctx, shape) {
    const paths = shape.paths || [];
    for (let i = 0; i < paths.length; i++) {
      paths[i].buildPath(ctx, paths[i].shape, true);
    }
  }

  afterBrush() {
    const paths = this.shape.paths || [];
    for (let i = 0; i < paths.length; i++) {
      paths[i].pathUpdated();
    }
  }
}
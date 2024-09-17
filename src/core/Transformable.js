class Transformable {
  updateTransform() {
    return;
  }

  getGlobalScale(out) {
    const m = this.transform;
    out = out || [];
    if (!m) {
      out[0] = 1;
      out[1] = 1;
      return out;
    }
  }
}
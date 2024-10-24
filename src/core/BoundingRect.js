
class BoundingRect {
  x
  y
  width
  height

  constructor(x, y, width, height) {
    if (width < 0) {
      x = x + width;
      width = -width;
    }
    if (height < 0) {
      y = y + height;
      height = -height;
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export default BoundingRect;
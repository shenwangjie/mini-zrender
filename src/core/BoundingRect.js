import Point from './Point';

const mathMin = Math.min;
const mathMax = Math.max;

const lt = new Point();
const rb = new Point();
const lb = new Point();
const rt = new Point();

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

  copy(other) {
    BoundingRect.copy(this, other);
  }

  applyTransform(m) {
    BoundingRect.applyTransform(this, this, m);
  }

  static copy(target, source) {
    target.x = source.x;
    target.y = source.y;
    target.width = source.width;
    target.height = source.height;
  }

  static applyTransform(target, source, m) {
    lt.x = lb.x = source.x;
    lt.y = rt.y = source.y;
    rb.x = rt.x = source.x + source.width;
    rb.y = lb.y = source.y + source.height;

    lt.transform(m);
    rt.transform(m);
    rb.transform(m);
    lb.transform(m);

    target.x = mathMin(lt.x, rb.x, lb.x, rt.x);
    target.y = mathMin(lt.y, rb.y, lb.y, rt.y);
    const maxX = mathMax(lt.x, rb.x, lb.x, rt.x);
    const maxY = mathMax(lt.y, rb.y, lb.y, rt.y);
    target.width = maxX - target.x;
    target.height = maxY - target.y;
  }
}

export default BoundingRect;
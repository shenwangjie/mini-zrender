import Gradient from "./Gradient"

export default class LinearGradient extends Gradient {
  constructor(x, y, x2, y2, colorStops, globalCoord) {
    super(colorStops);
    this.x = x == null ? 0 : x;
    this.y = y == null ? 0 : y;
    this.x2 = x2 == null ? 1 : x2;
    this.y2 = y2 == null ? 0 : y2;

    this.type = 'linear';

    this.global = globalCoord || false;
  }
}
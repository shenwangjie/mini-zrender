import { DEFAULT_FONT } from "../core/platform";
import { createObject, defaults } from "../core/util";
import Displayable from "./Displayable";
import { DEFAULT_PATH_STYLE } from "./Path";

export const DEFAULT_TSPAN_STYLE = defaults({
  strokeFirst: true,
  font: DEFAULT_FONT,
  x: 0,
  y: 0,
  textAlign: 'left',
  textBaseline: 'top',
  miterLimit: 2
}, DEFAULT_PATH_STYLE);

class TSpan extends Displayable {
  createStyle(obj) {
    return createObject(DEFAULT_TSPAN_STYLE, obj);
  }

  hasStroke() {
    const style = this.style;
    const stroke = style.stroke;
    return stroke != null && stroke !== 'none' && style.lineWidth > 0;
  }

  static initDefaultProps = (function () {
    const tspanProto = TSpan.prototype;
    tspanProto.dirtyRectTolerance = 10;
  })()
}

TSpan.prototype.type = 'tspan';

export default TSpan;
import { isNumber, isArray } from "../core/util";

export function normallizeLineDash(lineType, lineWidth) {
  if (!lineType || lineType === 'solid' || !(lineWidth > 0)) {
    return null;
  }
  return lineType === 'dashed'
        ? [4 * lineWidth, 2 * lineWidth]
        : lineType === 'dotted'
                ? [lineWidth]
                : isNumber(lineType)
                      ? [lineType] : isArray(lineType) ? lineType : null;
}

export function getLineDash(el) {
  const style = el.style;

  let lineDash = style.lineDash && style.lineWidth > 0 && normallizeLineDash(style.lineDash, style.lineWidth);
  let lineDashOffset = style.lineDashOffset;

  return [lineDash, lineDashOffset];
}

import { getLineHeight, getWidth } from '../../contain/text'
import { retrieve2 } from '../../core/util';

export function parsePlainText(text, style) {
  text != null && (text += '');

  const overflow = style.overflow;
  const padding = style.padding;
  const font = style.font;
  const truncate = overflow === 'truncate';
  const calculatedLineHeight = getLineHeight(font);
  const lineHeight = retrieve2(style.lineHeight, calculatedLineHeight);
  const bgColorDrawn = !!(style.backgroundColor);
  const truncateLineOverflow = style.lineOverflow === 'truncate';

  let width = style.width;
  let lines;
  if (width != null) {

  } else {
    lines = text ? text.split('\n') : [];
  }

  const contentHeight = lines.length * lineHeight;
  const height = retrieve2(style.height, contentHeight); // height

  if (contentHeight > height) {}

  if (text && truncate && width != null) {}

  let outerHeight = height;
  let contentWidth = 0;
  for (let i = 0; i < lines.length; i++) {
    contentWidth = Math.max(getWidth(lines[i], font), contentWidth);
  }
  if (width == null) {
    width = contentWidth
  } // width

  let outerWidth = contentWidth;
  if (padding) {}
  if (bgColorDrawn) {}

  return {
    lines: lines,
    height: height,
    outerWidth: outerWidth,
    outerHeight: outerHeight,
    lineHeight: lineHeight,
    calculatedLineHeight: calculatedLineHeight,
    contentWidth: contentWidth,
    contentHeight: contentHeight,
    width: width
  };
}
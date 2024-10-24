import { adjustTextY } from "../contain/text";
import { DEFAULT_FONT } from "../core/platform";
import { each, normalizeCssArray, trim } from "../core/util";
import Displayable from "./Displayable";
import TSPan from './TSpan';
import { parsePlainText } from './helper/parseText';

const DEFAULT_RICH_TEXT_COLOR = {
  fill: '#000'
};
const DEFAULT_STROKE_LINE_WIDTH = 2;

class ZRText extends Displayable {
  _defaultStyle = DEFAULT_RICH_TEXT_COLOR
  _children = []

  constructor(opts) {
    super();
    this.attr(opts);
  }

  childrenRef() {
    return this._children;
  }

  update() {
    super.update();

    if (this.styleChanged()) {
      this._updateSubTexts();
    }

    for (let i = 0; i < this._children.length; i++){
      const child = this._children[i];
      child.zlevel = this.zlevel;
      child.z = this.z;
      child.z2 = this.z2;
      child.culling = this.culling;
      child.cursor = this.cursor;
      child.invisible = this.invisible;
    }
  }

  getLocalTransform(m) {
    const innerTransformable = this.innerTransformable;
    return innerTransformable
        ? innerTransformable.getLocalTransform(m)
        : super.getLocalTransform(m);
  }

  _updatePlainTexts() {
    const style = this.style;
    const textFont = style.font || DEFAULT_FONT;
    const textPadding = style.padding;

    const text = getStyleText(style);
    const contentBlock = parsePlainText(text, style);
    const needDrawBg = needDrawBackground(style);
    const bgColorDrawn = !!(style.backgroundColor);

    const outerHeight = contentBlock.outerHeight;
    const outerWidth = contentBlock.outerWidth;
    const contentWidth = contentBlock.contentWidth;
    const textLines = contentBlock.lines;
    const lineHeight = contentBlock.lineHeight;

    const defaultStyle = this._defaultStyle;

    const baseX = style.x || 0;
    const baseY = style.y || 0;
    const textAlign = style.align || defaultStyle.align || 'left';
    const verticalAlign = style.verticalAlign || defaultStyle.verticalAlign || 'top';

    let textX = baseX;
    let textY = adjustTextY(baseY, contentBlock.contentHeight, verticalAlign);

    if (needDrawBg || textPadding) {}

    textY += lineHeight / 2;

    if (textPadding) {}

    let defaultLineWidth = 0;
    let useDefaultFill = false;
    const textFill = getFill(
      'fill' in style
          ? style.fill
          : (useDefaultFill = true, defaultStyle.fill)
    );
    const textStroke = getStroke(
      'stroke' in style 
            ? style.stroke
            : (!bgColorDrawn && (!defaultStyle.autoStroke || useDefaultFill))
            ? (defaultLineWidth = DEFAULT_STROKE_LINE_WIDTH, defaultStyle.stroke)
            : null
    );

    const hasShadow = style.textShadowBlur > 0;

    const fixedBoundingRect = style.width != null
        && (style.overflow === 'truncate' || style.overflow === 'break' || style.overflow === 'breakAll');
    const calculatedLineHeight = contentBlock.calculatedLineHeight;

    for (let i = 0; i < textLines.length; i++) {
      const el = this._getOrCreateChild(TSPan);
      const subElStyle = el.createStyle();
      el.useStyle(subElStyle);
      subElStyle.text = textLines[i];
      subElStyle.x = textX;
      subElStyle.y = textY;

      if (textAlign) {
        subElStyle.textAlign = textAlign;
      }
      subElStyle.textBaseline = 'middle';
      subElStyle.opacity = style.opacity;
      subElStyle.strokeFirst = true;

      if (hasShadow) {}

      subElStyle.stroke = textStroke;
      subElStyle.fill = textFill;

      if (textStroke) {}

      subElStyle.font = textFont;
      setSeparateFont(subElStyle, style);

      textY += lineHeight;

      if (fixedBoundingRect) {}
    }
  }

  _updateSubTexts() {
    this._childCursor = 0;

    normalizeTextStyle(this.style);
    this.style.rich
        ? console.log('not do this')
        : this._updatePlainTexts();

    this._children.length = this._childCursor;

    this.styleUpdated();
  }

  static makeFont(style) { 
    console.error('方法前面不加static就会报错');
    let font = '';
    if (hasSeparateFont(style)) {

    }
    return font && trim(font) || style.textFont || style.font;
  }

  _getOrCreateChild(Ctor) {
    let child = this._children[this._childCursor];
    if (!child || !(child instanceof Ctor)) {
      child = new Ctor();
    }
    this._children[this._childCursor++] = child;
    child.__zr = this.__zr;
    child.parent = this;
    return child;
  }

  updateTransform() {
    const innerTransformable = this.innerTransformable;
    if (innerTransformable) {

    } else {
      super.updateTransform();
    }
  }
}

export default ZRText;

export function normalizeTextStyle(style) {
  normalizeStyle(style);
  each(style.rich, normalizeStyle);
  return style;
}

const VALID_TEXT_ALIGN = { left: true, right: 1, center: 1 };
const VALID_TEXT_VERTICAL_ALIGN = { top: 1, bottom: 1, middle: 1 };
function normalizeStyle(style) {
  if (style) {
    style.font = ZRText.makeFont(style);
    let textAlign = style.align;
    textAlign === 'middle' && (textAlign = 'center');
    style.align = (
      textAlign == null || VALID_TEXT_ALIGN[textAlign]
    ) ? textAlign : 'left'; // center || left

    let verticalAlign = style.verticalAlign;
    verticalAlign === 'center' && (verticalAlign = 'middle');
    style.verticalAlign = (
      verticalAlign == null || VALID_TEXT_VERTICAL_ALIGN[verticalAlign]
    ) ? verticalAlign : 'top'; // middle || top

    const textPadding = style.padding;
    if (textPadding) {
      style.padding = normalizeCssArray(textPadding);
    }
  }
}

export function hasSeparateFont(style) {
  return style.fontSize != null || style.fontFamily || style.fontWeight;
}

function getStyleText(style) {
  let text = style.text;
  text != null && (text += ''); // 转化字符串
  return text;
}

function needDrawBackground(style) {
  return !!(
    style.backgroundColor
    || style.lineHeight
    || (style.borderWidth && style.borderColor)
  );
}

function getFill(fill) {
  return (fill == null || fill === 'none')
      ? null
      : (fill.image || fill.colorStops)
      ? '#000'
      : fill;
}

function getStroke(stroke, lineWidth) {
  return (stroke == null || lineWidth <= 0 || stroke === 'transparent' || stroke === 'none') 
      ? null
      : (stroke.image || stroke.colorStops)
      ? '#000'
      : stroke;
}

const FONT_PARTS = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily'];
function setSeparateFont(targetStyle, sourceStyle) {
  for (let i = 0; i < FONT_PARTS.length; i++) {
    const fontProp = FONT_PARTS[i];
    const val = sourceStyle[fontProp];
    if (val != null) {
      targetStyle[fontProp] = val;
    }
  }
}
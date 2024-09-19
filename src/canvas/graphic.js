import PathProxy from '../core/PathProxy.js'
import { SHAPE_CHANGED_BIT } from '../graphic/constants.js'
import Path from '../graphic/Path.js';

const DRAW_TYPE_PATH = 1;
const DRAW_TYPE_IMAGE = 2;
const DRAW_TYPE_TEXT = 3;
const DRAW_TYPE_INCREMENTAL = 4;

const pathProxyForDraw = new PathProxy(true);

export const DEFAULT_COMMON_STYLE = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: '#000',
  opacity: 1,
  blend: 'source-over'
}

const SHADOW_NUMBER_PROPS = ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];
const STROKE_PROPS = [
  ['lineCap', 'butt'],['lineJoin', 'miter'],['miterLimit', 10]
];

function styleHasStroke(style) {
  const stroke = style.stroke;
  return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0));
}

function styleHasFill(style) {
  const fill = style.fill;
  return fill != null && fill !== 'none';
}

function isTransformChanged(m0, m1) {
  if (m0 && m1) {
    return m0[0] !== m1[0] 
        || m0[1] !== m1[1]
        || m0[2] !== m1[2]
        || m0[3] !== m1[3]
        || m0[4] !== m1[4]
        || m0[5] !== m1[5];
  } else if (!m0 && !m1) {
    return false;
  }

  return true;
}

function flushPathDrawn(ctx, scope) {
  scope.batchFill && ctx.fill();
  scope.batchStroke && ctx.stroke();
  scope.batchFill = '';
  scope.batchStroke = '';
}

function setContextTransform(ctx, el) {
  const m = el.transform;
  const dpr = ctx.dpr || 1;
  if (m) {

  } else {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function getStyle(el, inHover) {
  return inHover ? (el.__hoverStyle || el.style) : el.style;
}

function isValidStrokeFillStyle(strokeOrFill) {
  return typeof strokeOrFill === 'string' && strokeOrFill !== 'none';
}

function doStrokePath(ctx, style) {
  ctx.stroke();
}

function bindCommonProps(ctx, style, prevStyle, forceSetAll, scope) {
  let styleChanged = false;
  if (forceSetAll || style.opacity !== prevStyle.opacity) {
    flushPathDrawn(ctx, scope);
    styleChanged = true;

    const opacity = Math.max(Math.min(style.opacity, 1), 0);
    ctx.globalAlpha = isNaN(opacity) ? DEFAULT_COMMON_STYLE.opacity : opacity;
  }

  if (forceSetAll || style.blend !== prevStyle.blend) {
    ctx.globalCompositeOperation = style.blend || DEFAULT_COMMON_STYLE.blend;
  }
  for (let i = 0; i < SHADOW_NUMBER_PROPS.length; i ++) {
    const propName = SHADOW_NUMBER_PROPS[i];
    if (forceSetAll || style[propName] !== prevStyle[propName]) {
      ctx[propName] = ctx.dpr * (style[propName] || 0);
    }
  }
  if (forceSetAll || style.shadowColor !== prevStyle.shadowColor) {
    ctx.shadowColor = style.shadowColor || DEFAULT_COMMON_STYLE.shadowColor;
  }
  return styleChanged;
}

function bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetAll, scope) {
  const style = getStyle(el, scope.inHover);
  const prevStyle = forceSetAll ? null : (prevEl && getStyle(prevEl, scope.inHover) || {});

  let styleChanged = bindCommonProps(ctx, style, prevStyle, forceSetAll, scope);

  if (forceSetAll || style.fill !== prevStyle.fill) {
    isValidStrokeFillStyle(style.fill) && (ctx.fillStyle = style.fill);
  }
  if (forceSetAll || style.stroke !== prevStyle.stroke) { 
    isValidStrokeFillStyle(style.stroke) && (ctx.strokeStyle = style.stroke);
  }
  if (forceSetAll || style.opacity !== prevStyle.opacity) {
    ctx.globalAlpha = style.opacity == null ? 1 : style.opacity;
  }
  for (let i = 0; i < STROKE_PROPS.length; i ++) {
    const prop = STROKE_PROPS[i];
    const propName = prop[0];
    if (forceSetAll || style[propName] !== prevStyle[propName]) {
      ctx[propName] = style[propName] || prop[1];
    }
  }

  return styleChanged;
}

export function brush(ctx, el, scope, isLast) {
  const m = el.transform;
  let forceSetTransform = false;
  let forceSetStyle = false;
  // 开始 brush
  el.beforeBrush && el.beforeBrush();
  el.innerBeforeBrush();

  const prevEl = scope.prevEl;
  if (!prevEl) {
    forceSetStyle = forceSetTransform = true;
  }

  if (forceSetTransform || isTransformChanged(m, prevEl.transform)) {
    flushPathDrawn(ctx, scope);
    setContextTransform(ctx, el);
  }

  let canBatchPath = el && el.autoBatch && canPathBatch(el.style);

  const style = getStyle(el, scope.inHover);
  if (el instanceof Path) {
    if (scope.lastDrawType !== DRAW_TYPE_PATH) {
      forceSetStyle = true;
      scope.lastDrawType = DRAW_TYPE_PATH;
    }

    bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetStyle, scope);
    if (!canBatchPath) {
      ctx.beginPath();
    }
    brushPath(ctx, el, style, canBatchPath);
  }

  el.innerAfterBrush();
  el.afterBrush && el.afterBrush();

  scope.prevEl = el;

  el.__dirty = 0;
  el._isRendered = true;
}

function brushPath(ctx, el, style, inBatch) {
  let hasStroke = styleHasStroke(style);
  let hasFill = styleHasFill(style);

  const strokePercent = style.strokePercent;
  const strokePart = strokePercent < 1;

  const firstDraw = !el.path;

  if ((!el.silent || strokePart) && firstDraw) {
    el.createPathProxy();
  }

  const path = el.path || pathProxyForDraw;
  const dirtyFlag = el._dirty;
  if (!inBatch) {
    const fill = style.fill;
    const stroke = style.stroke;
  }

  const scale = el.getGlobalScale();
  path.setScale(scale[0], scale[1], el.segmentIgnoreThreshold);

  let needsRebuild = true;
  if (firstDraw || (dirtyFlag & SHAPE_CHANGED_BIT)) {
    path.setDPR(ctx.dpr);
    if (strokePart) {

    } else {
      path.setContext(ctx);
      needsRebuild = false;
    }
    path.reset();

    el.buildPath(path, el.shape, inBatch);
    path.toStatic();

    el.pathUpdated();
  }

  if (!inBatch) {
    if (style.strokeFirst) {

    } else {
      if (hasStroke) {
        doStrokePath(ctx, style);
      }
    }
  }
}
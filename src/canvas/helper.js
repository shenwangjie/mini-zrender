function parseInt10(val) {
  return parseInt(val, 10);
}

export function getSize(root, whIdx, opts) {
  const wh = ['width', 'height'][whIdx];
  const cwh = ['clientWidth', 'clientHeight'][whIdx];
  const plt = ['paddingLeft', 'paddingTop'][whIdx];
  const prb = ['paddingRight', 'paddingBottom'][whIdx];

  // IE8不支持getComputedStyle，但它使用VML.
  const stl = document.defaultView.getComputedStyle(root);

  const root_cwh = root[cwh] // 1000 没有wh
  const stl_wh = parseInt10(stl[wh]) // '1000px' 没有cwh
  const root_s_wh = parseInt10(root.style[wh]) // '1000px' 没有cwh

  return ((root_cwh || stl_wh || root_s_wh) - (parseInt10(stl[plt]) || 0) - (parseInt10(stl[prb]) || 0)) || 0;
}

function isSafeNum(num) {
  // NaN、Infinity、undefined、'xx'
  return isFinite(num);
}

export function createLinearGradient(ctx, obj, rect) {
  let x = obj.x == null ? 0 : obj.x;
  let x2 = obj.x2 == null ? 1 : obj.x2;
  let y = obj.y == null ? 0 : obj.y;
  let y2 = obj.y2 == null ? 0 : obj.y2;

  if (!obj.global) {
    x = x * rect.width + rect.x;
    x2 = x2 * rect.width + rect.x;
    y = y * rect.height + rect.y;
    y2 = y2 * rect.height + rect.y;
  }

  x = isSafeNum(x) ? x : 0;
  x2 = isSafeNum(x2) ? x2 : 1;
  y = isSafeNum(y) ? y : 0;
  y2 = isSafeNum(y2) ? y2 : 0;

  const canvasGradient = ctx.createLinearGradient(x, y, x2, y2);

  return canvasGradient;
}

export function getCanvasGradient(ctx, obj, rect) {
  const canvasGradient = obj.type === 'radial'
        ? console.log('not do this')
        : createLinearGradient(ctx, obj, rect);

  const colorStops = obj.colorStops;
  for (let i = 0; i < colorStops.length; i++) {
    canvasGradient.addColorStop(
      colorStops[i].offset, colorStops[i].color
    );
  }
  return canvasGradient;
}
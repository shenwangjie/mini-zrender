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
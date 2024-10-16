import Path from "../graphic/Path";

function isPathProxy(path) {
  return path.setData != null;
}
// 合并路径
export function mergePath(pathEls, opts) {
  const pathList = [];
  const len = pathEls.length;
  for (let i = 0; i < len; i++) {
    const pathEl = pathEls[i];
    pathList.push(pathEl.getUpdatedPathProxy(true));
  }

  const pathBundle = new Path(opts);
  pathBundle.createPathProxy();
  pathBundle.buildPath = function (path) {
    if (isPathProxy(path)) {
      path.appendPath(pathList);
      // svg and vml renderer dont have context
      const ctx = path.getContext();
      if (ctx) {
        path.rebuildPath(ctx, 1);
      }
    }
  };

  return pathBundle;
}
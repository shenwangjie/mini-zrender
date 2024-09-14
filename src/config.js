import env from './core/env';

let dpr = 1;

// 如果在浏览器环境中
if (env.hasGlobalWindow) {
  dpr = Math.max(
    window.devicePixelRatio
    || (window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI)
    || 1, 1
  );
  // deviceXDPI 返回显示屏幕的每英寸水平点数。
  // logicalXDPI 返回显示屏幕每英寸的水平方向的常规点数。
}
// retina 屏幕优化
export const devicePixelRatio = dpr;
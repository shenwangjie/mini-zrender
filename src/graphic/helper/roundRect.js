
export function buildPath(ctx, shape) {
  let x = shape.x;
  let y = shape.y;
  let width = shape.width;
  let height = shape.height;
  let r = shape.r;
  let r1, r2, r3, r4;

  if (width < 0) {
    x += width;
    width = -width;
  }

  if (height < 0) {
    y += height;
    height = -height;
  }

  // 左上、右上、右下、左下角的半径依次为r1、r2、r3、r4
  // r缩写为1         相当于 [1, 1, 1, 1]
  // r缩写为[1]       相当于 [1, 1, 1, 1]
  // r缩写为[1, 2]    相当于 [1, 2, 1, 2]
  // r缩写为[1, 2, 3] 相当于 [1, 2, 3, 2]
  if (typeof r === 'number') {
    r1 = r2 = r3 = r4 = r;
  } else if (r instanceof Array) {
    if (r.length === 1) {
      r1 = r2 = r3 = r4 = r[0];
    } else if (r.length === 2) {
      r1 = r3 = r[0];
      r2 = r4 = r[1];
    } else if (r.length === 3) {
      r1 = r[0];
      r2 = r4 = r[1];
      r3 = r[2];
    } else {
      r1 = r[0];
      r2 = r[1];
      r3 = r[2];
      r4 = r[3];
    }
  } else {
    r1 = r2 = r3 = r4 = 0;
  }

  let total;
  // 赋值运算符优先级很低
  // 减小
  // 结果相加都是width || height
  if (r1 + r2 > width) {
    total = r1 + r2;
    r1 *= width / total;
    r2 *= width / total;
  } else if (r3 + r4 > width) {
    total = r3 + r4;
    r3 *= width / total;
    r4 *= width / total;
  } else if (r2 + r3 > height) {
    total = r2 + r3;
    r2 *= height / total;
    r3 *= height / total;
  } else if (r1 + r4 > height) {
    total = r1 + r4;
    r1 *= height / total;
    r4 *= height / total;
  }

  // arc() 方法创建一个以坐标 (x, y) 为中心，以 radius 为半径的圆弧。路径从 startAngle 开始，到 endAngle 结束，路径方向由 counterclockwise 参数决定（默认为顺时针方向）。
  ctx.moveTo(x + r1, y);
  ctx.lineTo(x + width - r2, y);
  r2 !== 0 && ctx.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
  ctx.lineTo(x + width, y + height - r3);
  r3 !== 0 && ctx.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
  ctx.lineTo(x + r4, y + height);
  r4 !== 0 && ctx.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r1);
  r1 !== 0 && ctx.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
}
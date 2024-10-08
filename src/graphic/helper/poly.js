import smoothBezier from '../../graphic/helper/smoothBezier'
import PathProxy from '../../core/PathProxy';

export function buildPath(ctx, shape, closePath) {
  const smooth = shape.smooth;
  let points = shape.points;
  if (points && points.length >= 2) {
    if (smooth) {
      // const controlPoints = smoothBezier(
      //   points, smooth, closePath, shape.smoothConstraint
      // );
    } else {
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1, l = points.length; i < l; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
    }
  
    closePath && ctx.closePath();
  } 
}
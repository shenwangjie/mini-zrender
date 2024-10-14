import env from "./env";

const firefoxNotSupportOffsetXY = env.browser.firefox
    // FireFox >=39 才可以使用 offsetX/offsetY
    && +(env.browser.version).split('.')[0] < 39;

export function getNativeEvent(e) {
  return e || window.event; // For IE
}

export function clientToLocal(el, e, out, calculate) {
  out = out || {};

  if (firefoxNotSupportOffsetXY && e.layerX != null && e.layerY && e.layerX !== e.offsetX) {
    out.zrX = e.layerX;
    out.zrY = e.layerY;
  } else if (e.offsetX != null) {
    // For IE6+, chrome, safari, opera, firefox >= 39
    out.zrX = e.offsetX;
    out.zrY = e.offsetY;
  } else {
    // 其他设备，如iOS safari
    calculateZrXY(el, e, out);
  }

  return out;
}

function calculateZrXY(el, e, out) {
  console.log('其他设备');
}

function getWheelDeltaMayPolyfill(e) {
  const rawWheelDelta = e.wheelDelta;
  if (rawWheelDelta) {
    return rawWheelDelta;
  }

  const deltaX = e.deltaX;
  const deltaY = e.deltaY;
  if (deltaX == null || deltaY == null) {
    return rawWheelDelta;
  }
}

export function normalizeEvent(el, e, calculate) {
  e = getNativeEvent(e);

  if (e.zrX != null) {
    return e;
  }

  const eventType = e.type;
  const isTouch = eventType && eventType.indexOf('touch') >= 0;

  if (!isTouch) {
    clientToLocal(el, e, e, calculate);
    const wheelDelta = getWheelDeltaMayPolyfill(e);
    e.zrDelta = wheelDelta ? wheelDelta / 120 : -(e.detail || 0) / 3;
    // zrX/zrY/zrDelta
  }

  // const button = e.button;

  return e;
}
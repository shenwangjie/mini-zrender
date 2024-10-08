
const protoKey = '__proto__';

const objToString = Object.prototype.toString;

let idStart =  0x0907;
export function guid() {
  return idStart++;
}

export function keys(obj) {
  if (!obj) {
    return [];
  }

  if (Object.keys) {
    return Object.keys(obj);
  }
  let keyList = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keyList.push(key);
    }
  }
  return keyList;
}

export function createObject(proto = null, properties = null) {
  let obj;
  if (Object.create) {
    obj = Object.create(proto);
  } else {
    const StyleCtor = function () {};
    StyleCtor.prototype = proto;
    obj = new StyleCtor()
  }

  if (properties) {
    extend(obj, properties); // 对象拼接拿到新的obj
  }

  return obj;
}

export function extend(target, obj) {
  if (Object.assign) {
    Object.assign(target, obj)
  } else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key) && key !== protoKey) {
        target[key] = obj[key]
      }
    }
  }
  return target;
}

export function defaults(target, obj, overlay = undefined) {
  const keysArr = keys(obj);
  for (let i = 0; i < keysArr.length; i++ ) {
    let key = keysArr[i];
    if (overlay ? obj[key] != null : target[key] == null) { // 为null才会覆盖
      target[key] = obj[key]
    }
  }
  return target;
}

export function mixin(target, obj, override = undefined) {
  target = 'prototype' in target ? target.prototype : target;
  obj = 'prototype' in obj ? obj.prototype : obj;

  if (Object.getOwnPropertyNames) {
    const keyList = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < keyList.length; i ++) {
      const key = keyList[i];
      if (key !== 'constructor') {
        if (override ? obj[key] != null : target[key] == null) {
          target[key] = obj[key];
        }
      }
    }
  } else {
    defaults(target, obj, override);
  }
}

export function disableUserSelect(dom) {
  const domStyle = dom.style;
  domStyle.webkitUserSelect = 'none';
  domStyle.userSelect = 'none';
  domStyle.webkitTapHighlightColor = 'rgba(0,0,0,0)';
  domStyle['webkit-touch-callout'] = 'none';
}

export function isArrayLike(data) {
  if (!data) {
    return false;
  }
  if (typeof data === 'string') {
    return false;
  }
  return typeof data.length === 'number';
}

export function isNumber(value) {
  // 在chromium和webkit上的表现判断方法比objToString.call更快
  // new Number()很少被使用
  return typeof value === 'number';
}

// 是否是NaN
export function eqNaN(value) {
  return value !== value;
}

export function isArray(value) {
  if (Array.isArray) {
    return Array.isArray(value);
  }
  return objToString.call(value) === '[object Array]';
}
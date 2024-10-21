
const protoKey = '__proto__';

const BUILTIN_OBJECT = reduce([
  'Function',
  'RegExp',
  'Date',
  'Error',
  'CanvasGradient',
  'CanvasPattern',
  // node-canvas
  'Image',
  'Canvas'
], (obj, val) => {
  obj['[object ' + val + ']'] = true;
  return obj;
}, {});

const TYPED_ARRAY = reduce([
  'Int8',
  'Uint8',
  'Uint8Clamped',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64'
], (obj, val) => {
  obj['object ' + val + 'Array]'] = true;
  return obj;
}, {});

const objToString = Object.prototype.toString;

const arrayProto = Array.prototype;
const nativeForEach = arrayProto.forEach;
const nativeSlice = arrayProto.slice;
const nativeMap = arrayProto.map;

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

export function isObject(value) {
  const type = typeof value;
  return type === 'function' || (!!value && type === 'object');
}

// 数组或对象遍历
export function each(arr, cb, context) {
  if (!(arr && cb)) {
    return;
  }
  if (arr.forEach && arr.forEach === nativeForEach) {
    arr.forEach(cb, context);
  } else if (arr.length === +arr.length) {
    // 转化为数字 +
    for (let i = 0, len = arr.length; i < len; i++) {
      cb.call(context, arr[i], i, arr);
    }
  } else {
    for (let key in arr) {
      if (arr.hasOwnProperty(key)) {
        cb.call(context, arr[key], key, arr)
      }
    }
  }
}

export function slice(arr, ...args) {
  return nativeSlice.apply(arr, args);
  // return nativeSlice.call(arr, args[0], args[1], args[2]...);
}

export function map(arr, cb, context) {
  if (!arr) {
    return [];
  }
  if (!cb) {
    return slice(arr);
  }
  if (arr.map && arr.map === nativeMap) {
    return arr.map(cb, context);
  } else {
    const result = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      result.push(cb.call(context, arr[i], i, arr));
    }
    return result;
  }
}

export function reduce(arr, cb, memo, context) {
  if (!(arr && cb)) return;
  for (let i = 0, len = arr.length; i < len; i++) {
    memo = cb.call(context, memo, arr[i], i, arr);
  }
  return memo;
}

// ownerDocument是Node对象的一个属性。返回的是某个元素的根节点文档对象，即document 对象
// documentElement是document对象的属性，返回的是文档根节点。
export function isDom(value) {
  return typeof value === 'object'
      && typeof value.nodeType === 'number'
      && typeof value.ownerDocument === 'object'
}

const primitiveKey = '__ec_primitive__';

export function isPrimitive(obj) {
  return obj[primitiveKey];
}

export function clone(source) {
  if (source == null || typeof source !== 'object') {
    return source;
  }

  let result = source;
  const typeStr = objToString.call(source);
  if (typeStr === '[object Array]') {
    if (!isPrimitive(source)) {
      
    }
  } else if (TYPED_ARRAY[typeStr]) {
    if (!isPrimitive(source)) {

    }
  } else if (BUILTIN_OBJECT[typeStr]) {
    if (!isPrimitive(source) && !isDom(source)) {

    }
  }

  return result;
}
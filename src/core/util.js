
const protoKey = '__proto__';

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
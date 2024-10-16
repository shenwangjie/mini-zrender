import {
  keys,
  isArrayLike,
  isNumber,
  eqNaN
} from '../core/util'
import Clip from '../animation/Clip'

export function cloneValue(value) {
  if (isArrayLike(value)) {

  }
  return value;
}

const VALUE_TYPE_NUMBER = 0;
const VALUE_TYPE_1D_ARRAY = 1;
const VALUE_TYPE_2D_ARRAY = 2;
const VALUE_TYPE_COLOR = 3;
const VALUE_TYPE_LINERA_GRADIENT = 4;
const VALUE_TYPE_RADIAL_GRADIENT = 5;
const VALUE_TYPE_UNKOWN = 6;

function interpolateNumber(p0, p1, percent) {
  return (p1 - p0) * percent + p0;
}

function interpolate1DArray(out, p0, p1, percent) {
  const len = p0.length;
  for (let i = 0; i < len; i++) {
    out[i] = interpolateNumber(p0[i], p1[i], percent);
  }
  return out;
}

function interpolate2DArray(out, p0, p1, percent) {
  const len = p0.length;
  const len2 = len && p0[0].length;
  for (let i = 0; i < len; i++) {
    if (!out[i]) {
      out[i] = [];
    }
    for (let j = 0; j < len2; j++) {
      out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
    }
  }
  return out;
}

export default class Animator {
  animation

  _tracks = {}
  _trackKeys = []

  targetName

  _onframeCbs
  _doneCbs

  _clip = null

  _loop
  _delay
  _maxTime = 0

  // 0: Not started
  // 1: Invoked started
  // 2: 已经至少跑了1帧
  _started = 0
  
  constructor(target, loop) {
    this._target = target;
    this._loop = loop;
  }

  // 添加动画每一帧的回调函数
  during(cb) {
    if (cb) {
      if (!this._onframeCbs) {
        this._onframeCbs = [];
      }
      this._onframeCbs.push(cb);
    }
    return this;
  }

  // 添加完成动画的回调函数
  done(cb) {
    if (cb) {
      if (!this._doneCbs) {
        this._doneCbs = [];
      }
      this._doneCbs.push(cb);
    }
    return this;
  }

  getClip() {
    return this._clip;
  }

  // 设置动画帧
  when(time, props, easing) {
    return this.whenWithKeys(time, props, keys(props), easing);
  }

  whenWithKeys(time, props, propNames, easing) {
    const tracks = this._tracks;
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      let track = tracks[propName];
      if (!track) {
        track = tracks[propName] = new Track(propName);

        let initialValue = this._target[propName];
        if (initialValue == null) {
          console.error('非法属性：' + propName);
          continue;
        }

        if (time > 0) {
          track.addKeyFrame(0, cloneValue(initialValue), easing);
        }

        this._trackKeys.push(propName);
      }
      track.addKeyFrame(time, cloneValue(props[propName]), easing);
    }
    this._maxTime = Math.max(this._maxTime, time);
    return this;
  }

  // 开始动画
  start(easing) {
    if (this._started > 0) {
      return
    }
    this._started = 1;

    const self = this;

    const tracks = [];
    const maxTime = this._maxTime || 0;
    for (let i = 0; i < this._trackKeys.length; i++) {
      const propName = this._trackKeys[i];
      const track = this._tracks[propName];
      track.prepare(maxTime, undefined);
      if (track.needsAnimate()) {
        tracks.push(track);
      }
    }

    if (tracks.length) {
      const clip = new Clip({
        life: maxTime,
        loop: this._loop,
        delay: this._delay || 0,
        onframe(percent) {
          self._started = 2;

          for (let i = 0; i < tracks.length; i++) {
            tracks[i].step(self._target, percent)
          }

          const onframeList = self._onframeCbs;
          if (onframeList) {
            for (let i = 0; i < onframeList.length; i++) {
              onframeList[i](self._target, percent);
            }
          }
        },
        ondestroy() {}
      })
      this._clip = clip;

      if (this.animation) {
        this.animation.addClip(clip);
      }
    }
    return this;
  }
}

function isArrayValueType(valType) {
  return valType === VALUE_TYPE_1D_ARRAY || valType === VALUE_TYPE_2D_ARRAY;
}

class Track {
  keyframes = []
  propName
  valType
  discrete = false

  _lastFrame = 0

  _additiveTrack

  constructor(propName) {
    this.propName = propName;
  }

  addKeyFrame(time, rawValue, easing) {
    let valType = VALUE_TYPE_UNKOWN;

    let keyframes = this.keyframes;
    let len = keyframes.length;

    let discrete = false;
    let value = rawValue;

    if (isNumber(rawValue) && !eqNaN(rawValue)) {
      valType = VALUE_TYPE_NUMBER;
    }

    if (len === 0) {
      this.valType = valType;
    }

    this.discrete = this.discrete || discrete;

    const kf = {
      time,
      value,
      rawValue,
      percent: 0
    }
    keyframes.push(kf);
    return kf;
  }

  prepare(maxTime, additiveTrack) {
    let kfs = this.keyframes;
    const kfsLen = kfs.length;
    for (let i = 0; i < kfsLen; i++) {

    }
  }

  needsAnimate() {
    return this.keyframes.length >= 1;
  }

  step(target, percent) {
    const keyframes = this.keyframes;
    const kfsNum = keyframes.length;

    let frameIdx;
    const lastFrame = this._lastFrame;
    const mathMin = Math.min;
    let frame, nextFrame;
    if (kfsNum === 1) {

    } else {
      for (frameIdx = lastFrame; frameIdx < kfsNum; frameIdx++) {
        if (keyframes[frameIdx].percent > percent) {
          break;
        }
      }
      frameIdx = mathMin(frameIdx - 1, kfsNum - 2);

      nextFrame = keyframes[frameIdx + 1];
      frame = keyframes[frameIdx];
    }

    const isAdditive = this._additiveTrack != null;
    const valueKey = isAdditive ? 'additiveValue' : 'value';
    const propName = this.propName;

    const interval = nextFrame.percent - frame.percent;
    let w = interval === 0 ? 1 : mathMin((percent - frame.percent) / interval, 1);

    const valType = this.valType;
    const isValueColor = valType === VALUE_TYPE_COLOR;

    let targetArr = isAdditive ? this._additiveValue : target[propName];
    if ((isArrayValueType(valType) || isValueColor) && !targetArr) {
      targetArr = this._additiveValue = [];
    }
    if (this.discrete) {

    } else if (isArrayValueType(valType)) {
      valType === VALUE_TYPE_1D_ARRAY
          ? interpolate1DArray(targetArr, frame, nextFrame, w)
          : interpolate2DArray(targetArr, frame, nextFrame, w);
    } else {
      const value = interpolateNumber(frame[valueKey], nextFrame[valueKey], w);
      target[propName] = value;
    }
  }
}
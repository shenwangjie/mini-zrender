import Eventful from '../core/Eventful'

export function getTime() {
  return new Date().getTime()
}

export default class Animation extends Eventful {
  _head
  _tail

  constructor(opts) {
    super();
    opts = opts || {};
    this.stage = opts.stage || {};

    this._running = false; // 是否正在动画

    this._time = 0; // 时间戳
    this._pausedTime = 0; // 暂停的时间

    this._paused = false; // 暂停状态
  }

  update(notTriggerFrameAndStageUpdate = undefined) {
    const time = getTime() - this._pausedTime;
    const delta = time - this._time;
    let clip = this._head;
    while (clip) {
      const nextClip = clip.next;
      let finished = clip.step(time, delta);
      clip = nextClip;
    }

    this._time = time;

    if (!notTriggerFrameAndStageUpdate) {
      // console.error('这里不懂什么意思，只知道frame和帧有关')
      // 'frame' should be triggered before stage, because upper application
      // depends on the sequence (e.g., echarts-stream and finish
      // event judge)
      this.trigger('frame', delta);

      this.stage.update && this.stage.update();
    }
  }

  _startLoop() {
    const self = this;

    this._running = true;

    function step() {
      if (self._running) {
        requestAnimationFrame(step);
        !self._paused && self.update(); // 没暂停的情况就继续走update()
      }
    }

    requestAnimationFrame(step);
  }

  // 开始动画
  start() {
    if (this._running) {
      return
    }

    this._time = getTime();
    this._pausedTime = 0;

    this._startLoop();
  }

  // 停止动画
  stop() {
    this._running = false;
  }
  
  addAnimator(animator) {
    animator.animation = this;
    // const clip = animator.getClip();
    // if (clip) {
    //   this.addClip(clip);
    // }
  }

  addClip(clip) {
    if (!this._head) {
      this._head = this._tail = clip;
    }
    clip.animation = this;
  }
}
export default class Clip {
  _life
  _delay
  _startTime

  loop

  _pausedTime = 0

  animation

  onframe
  ondestroy
  onrestart

  easingFunc

  // 只读
  next
  prev

  _inited = false

  constructor(opts) {
    this._life = opts.life || 1000;
    this._delay = opts.delay || 0;
    this.loop = opts.loop || false;
    this.onframe = opts.onframe || function(){}
    this.ondestroy = opts.ondestroy || function(){}
    this.onrestart = opts.onrestart || function(){}
  }

  step(globalTime, deltaTime) {
    if (!this._inited) {
      this._startTime = globalTime + this._delay;
      this._inited = true;
    }

    let elapsedTime = globalTime - this._startTime - this._pausedTime;
    let percent = elapsedTime / this._life;
    if (percent < 0) {
      percent = 0;
    }
    percent = Math.min(percent, 1);
    const easingFunc = this.easingFunc;
    const schedule = easingFunc ? easingFunc(percent) : percent;

    this.onframe(schedule);

    if (percent == 1) {
      if (this.loop) {
        const remainder = elapsedTime % this._life;
        this._startTime = globalTime - remainder;
        this._pausedTime = 0;

        this.onrestart();
      } else {
        return true;
      }
    }
    return false;
  }
}
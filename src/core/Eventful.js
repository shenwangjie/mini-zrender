
export default class Eventful {
  constructor() {
    this._$handlers = null
  }

  trigger(eventType, ...args) {
    if (!this._$handlers) {
      return this;
    }
    
    return this;
  }
}
import Eventful from './core/Eventful'

class EmptyProxy extends Eventful {
  constructor() {
    this.handler = null;
  }
}
class Handler extends Eventful {
  constructor(
    storage,
    painter,
    proxy,
    painterRoot,
    pointerSize
  ) {
    super();
    this.storage = storage;
    this.painter = painter;
    this.painterRoot = painterRoot;
    this._pointerSize = pointerSize;
    proxy = proxy || new EmptyProxy()
    /**
    * Proxy of event. can be Dom, WebGLSurface, etc.
    */
    this.proxy = null;
    console.error('不是很理解')
  }
}

export default Handler
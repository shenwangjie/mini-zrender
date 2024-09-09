
import Eventful from '../core/Eventful'
export default class HandlerDomProxy extends Eventful {
  constructor(dom, painterRoot) {
    super();
    this.dom = dom;
    this.painterRoot = painterRoot;
  }
}


export class Entry {
  value

  constructor(val) {
    this.value = val;
  }
}

export class LinkedList {
  _len = 0

  len() {
    return this._len;
  }

  insertEntry(entry) {
    if (!this.head) {
      this.head = this.tail = entry;
    }
    this._len++;
  }
}

export default class LRU {
  _list = new LinkedList()
  _maxSize = 10
  _map = {}
  
  constructor(maxSize) {
    this._maxSize = maxSize;
  }

  get(key) {
    const entry = this._map[key];
    const list = this._list;
    if (entry != null) {
      
    }
  }

  put(key, value) {
    const list = this._list;
    const map = this._map;
    let removed = null;
    if (map[key] == null) {
      const len = list.len();
      let entry = this._lastRemovedEntry;

      if (len >= this._maxSize && len > 0) {

      }

      if (entry) {

      } else {
        entry = new Entry(value);
      }
      entry.key = key;
      list.insertEntry(entry);
      map[key] = entry;
    }

    return removed;
  }
}
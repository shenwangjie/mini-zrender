
import { Dictionary } from './core/types'
import * as zrUtil from './core/util' // 全部导出并设定对象zrUtil
import { PainterBase } from './PainterBase';
import env from './core/env';

type PainterBaseCtor = {
  new(dom: HTMLElement, storage: Storage, ...args: any[]): PainterBase
}
const painterCtors: Dictionary<PainterBaseCtor> = {};
let instances: { [key: number]: ZRender } = {};

class ZRender {
  id: number
  dom?: HTMLElement
  storage: Storage
  painter: PainterBase
  // handler: 
  constructor(id: number, dom?: HTMLElement, opts?: ZRenderInitOpt) {
    console.error('type PainterBaseCtor存在疑问，待解决。。。。。')
    this.id = id;
    this.dom = dom;

    opts = opts || {};

    const storage = new Storage(); // 创建存储实例

    let rendererType = opts.renderer || 'canvas' // 渲染器种类

    const painter = new painterCtors[rendererType](dom, storage, opts, id) // 创建painter实例

    this.storage = storage
    this.painter = painter

    const handlerProxy = (!env.node && !env.worker) ? new : null
    let pointerSize;

    this.handler = new Handler(storage, painter, )
  }
}

export interface ZRenderInitOpt {
  renderer?: string // 渲染器使用 'canvas' or 'svg'
  devicePixelRatio?: number // 设备像素比
  width?: number | string
  height?: number | string
  ssr?: boolean // 是否允许ssr模式
}
/**
 * 初始化一个 zrender 的实例
 * 入口方法
 */
export function init(dom?: HTMLElement | null, opts?: ZRenderInitOpt) {
  const zr = new ZRender(zrUtil.guid(), dom, opts);
  instances[zr.id] = zr;
  return zr;
}

export function registerPainter(name: string, Ctor: PainterBaseCtor) {
  painterCtors[name] = Ctor
}
import { PainterBase } from "../PainterBase";
import Storage from "../storage";

interface CanvasPainterOption {
  devicePixelRatio?: number // 设备像素比
  width?: number | string
  height?: number | string
}

export default class CanvasPainter implements PainterBase {
  type: 'canvas'

  root: HTMLElement;

  storage: Storage

  constructor(dom: HTMLElement, storage: Storage, opts: CanvasPainterOption, id: number) {

  }
}
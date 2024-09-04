export interface PainterBase {
  type: string

  root?: HTMLElement // 如果是ssr模式，root就会是undefined
}
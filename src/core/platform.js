export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_FONT_FAMILY = 'sans-serif';
export const DEFAULT_FONT = `${DEFAULT_FONT_SIZE}px ${DEFAULT_FONT_FAMILY}`;
export const platformApi = {
  createCanvas() {
    return typeof document !== 'undefined' 
    && document.createElement('canvas');
  },

  measureText: (function() {
    let _ctx;
    let _cachedFont;
    return (text, font = undefined) => {
      if (!_ctx) {
        const canvas = platformApi.createCanvas();
        _ctx = canvas && canvas.getContext('2d');
      }
      if (_ctx) {
        if (_cachedFont !== font) {
          _cachedFont = _ctx.font = font || DEFAULT_FONT;
        }
        return _ctx.measureText(text);
      } 
    }
  })(),
}
export const platformApi = {
  createCanvas() {
    return typeof document !== 'undefined' 
    && document.createElement('canvas');
  },

  measureText: (function() {
    let _ctx;
    let _cachedFont;
    return (text, font = undefined) => {
      
    }
  })(),
}
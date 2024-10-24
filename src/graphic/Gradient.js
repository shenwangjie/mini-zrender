
export default class Gradient {
  colorStops

  constructor(colorStops) {
    this.colorStops = colorStops || [];
  }

  addColorStop(offset, color) {
    this.colorStops.push({
      offset,
      color
    })
  }
}
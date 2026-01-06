export class Parallax {
  constructor(layers, camera) {
    this.layers = layers
    this.camera = camera
  }
  
  update() {
    this.layers.forEach((layer, index) => {
      const speed = layer.speed || (index + 1) * 0.1
      layer.offsetX = -this.camera.x * speed
    })
  }
  
  getLayerPositions() {
    return this.layers.map(layer => ({
      ...layer,
      x: layer.offsetX
    }))
  }
}


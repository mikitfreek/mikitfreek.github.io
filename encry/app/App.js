import { Render } from './core/Render.js'

const glob = globalThis

class App {
  Renderer

  constructor() {
    glob.window.onload = () => {
      this.Renderer = new Render()
    }
  }
}

new App()

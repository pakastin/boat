export default class KeyboardHandler {
  constructor() {
    this.keysDown = {};
    window.addEventListener("keydown", this);
    window.addEventListener("keyup", this);
  }
  destroy() {
    window.removeEventListener("keydown", this);
    window.removeEventListener("keyup", this);
  }

  handleEvent(e) {
    const key = e.code;
    const pressed = e.type === "keydown";

    this.keysDown[key] = pressed;
  }
}

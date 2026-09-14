export default class JoystickHandler {
  constructor(el) {
    this.valueX = 0;
    this.valueY = 0;
    this.el = el;
    this.nib = el.querySelector("joystick-nib");

    this.nib.addEventListener("touchstart", this);
    this.nib.addEventListener("mousedown", this);
  }
  handleEvent(e) {
    const touches = e.touches && [...e.touches];
    const touch = touches?.find((touch) => touch.target === this.nib);
    const pageX = touch ? touch.pageX : e.pageX;
    const pageY = touch ? touch.pageY : e.pageY;

    if (e.type === "mousedown" || e.type === "touchstart") {
      e.preventDefault();

      this.startX = pageX;
      this.startY = pageY;

      window.addEventListener("touchmove", this);
      window.addEventListener("mousemove", this);
      window.addEventListener("touchend", this);
      window.addEventListener("mouseup", this);
      return;
    }

    if (e.type === "mouseup" || e.type === "touchend") {
      this.nib.style.transform = "none";
      window.removeEventListener("touchmove", this);
      window.removeEventListener("mousemove", this);
      window.removeEventListener("touchend", this);
      window.removeEventListener("mouseup", this);
      this.valueX = this.valueY = 0;
      return;
    }

    let dx = pageX - this.startX;
    let dy = pageY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 16) {
      dx = (dx / dist) * 16;
      dy = (dy / dist) * 16;
    }
    this.valueX = dx / 16;
    this.valueY = -dy / 16;
    if (this.rendering) {
      return;
    }
    this.rendering = requestAnimationFrame(() => {
      this.rendering = null;
      this.render();
    });
  }
  render() {
    this.nib.style.transform = `translate(${this.valueX}rem, ${-this.valueY}rem)`;
  }
}

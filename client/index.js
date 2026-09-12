import Boat from "./boat.js";
import KeyboardHandler from "./keyboard-handler.js";

const boat = new Boat({
  maxX: window.innerWidth,
  maxY: window.innerHeight,
});
document.body.appendChild(boat.el);

const keyboardHandler = new KeyboardHandler();

window.addEventListener("resize", resize);
resize();

let lastTime = Date.now();
setTimeout(update, 1000 / 60);
render();

function update() {
  setTimeout(update, 1000 / 60);

  boat.throttle = 0;
  boat.steer = 0;

  const actions = {
    ArrowUp() {
      boat.throttle = 1;
    },
    ArrowDown() {
      boat.throttle = -1;
    },
    ArrowLeft() {
      boat.steer = -1;
    },
    ArrowRight() {
      boat.steer = 1;
    },
  };

  for (const key in keyboardHandler.keysDown) {
    const value = keyboardHandler.keysDown[key];
    if (value) {
      if (actions[key]) {
        actions[key]();
      }
    }
  }

  let time = Date.now();
  boat.update(time - lastTime);
}

function render() {
  requestAnimationFrame(render);

  boat.render();
}

function resize() {
  boat.maxX = window.innerWidth;
  boat.maxY = window.innerHeight;
}

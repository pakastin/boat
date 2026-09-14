import Boat from "./boat.js";
import KeyboardHandler from "./keyboard-handler.js";
import JoystickHandler from "./joystick-handler.js";

const boat = new Boat({
  maxX: window.innerWidth,
  maxY: window.innerHeight,
});
document.body.appendChild(boat.el);

const throttle = document.createElement("joystick");
const steer = document.createElement("joystick");

const throttleNib = document.createElement("joystick-nib");
const steerNib = document.createElement("joystick-nib");

throttle.appendChild(throttleNib);
steer.appendChild(steerNib);

const throttleHandler = new JoystickHandler(throttle);
const steerHandler = new JoystickHandler(steer);

throttle.classList.add("throttle");
steer.classList.add("steer");

document.body.appendChild(throttle);
document.body.appendChild(steer);

const stats = document.createElement("stats");

document.body.appendChild(stats);

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

  boat.throttle = throttleHandler.valueY;
  boat.steer = steerHandler.valueX;

  const actions = {
    ArrowUp() {
      boat.throttle = 1;
    },
    KeyW() {
      boat.throttle = 1;
    },
    ArrowDown() {
      boat.throttle = -1;
    },
    KeyS() {
      boat.throttle = -1;
    },
    ArrowLeft() {
      boat.steer = -1;
    },
    KeyA() {
      boat.steer = -1;
    },
    ArrowRight() {
      boat.steer = 1;
    },
    KeyD() {
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
  stats.textContent = `${Math.round(boat.forwardVelocity / 10)} kn`;
}

function resize() {
  boat.maxX = window.innerWidth;
  boat.maxY = window.innerHeight;
}

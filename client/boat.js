const svg = await fetch("img/boat.svg").then((res) => res.text());

export default class Boat {
  constructor({ maxX, maxY }) {
    this.el = document.createElement("boat");
    this.el.innerHTML = svg;
    this.boat = this.el.querySelector("svg");

    this.maxX = maxX;
    this.maxY = maxY;

    this.x = maxX / 2;
    this.y = maxY / 2;

    this.heading = 0;
    this.angularVelocity = 0;

    this.vx = 0;
    this.vy = 0;

    // Inputs, both expected in [-1, 1]
    this.throttle = 0;
    this.steer = 0;

    // --- Mass / inertia ---
    // Higher mass = more momentum = harder to stop precisely (good for docking tension)
    this.mass = 2.2;
    this.momentOfInertia = 150; // higher = slower to spin up/down

    // --- Engine ---
    this.maxThrustForward = 260;
    this.maxThrustReverse = 120; // real outboards are weaker in reverse
    this.engineResponse = 5; // how fast the prop catches up to the throttle input
    this.currentThrustFraction = 0;

    // --- Steering ---
    this.maxSteerAngle = 35;
    this.motorDistance = 59.5;
    this.steerResponse = 8; // how fast the motor swings to the commanded angle
    this.currentSteerFraction = 0;

    // --- Drag: linear term dominates at low speed, quadratic term dominates
    // at high speed and is what naturally caps top speed (no hard clamp needed) ---
    this.forwardLinearDrag = 0.5;
    this.forwardQuadraticDrag = 0.0029;

    // Hull resists sliding sideways much more than moving forward (keel effect)
    this.lateralLinearDrag = 25;
    this.lateralQuadraticDrag = 0.5;

    this.angularLinearDrag = 90;
    this.angularQuadraticDrag = 4;

    // Safety net only — the drag model above should make this a non-issue
    this.maxSpeed = 500;

    this.motor = this.el.querySelector("rect");
    this.motor.style.transformOrigin = `${62 + 6}px ${121 + 10.5}px`;
  }

  update() {
    const dt = 1 / 60;

    // Engine and steering don't respond instantly — smooth toward the target
    this.currentThrustFraction +=
      (this.throttle - this.currentThrustFraction) *
      (1 - Math.exp(-this.engineResponse * dt));

    this.currentSteerFraction +=
      (this.steer - this.currentSteerFraction) *
      (1 - Math.exp(-this.steerResponse * dt));

    const heading = (this.heading * Math.PI) / 180;
    const forwardX = Math.sin(heading);
    const forwardY = -Math.cos(heading);
    const rightX = Math.cos(heading);
    const rightY = Math.sin(heading);

    const motorAngle =
      (this.currentSteerFraction * this.maxSteerAngle * Math.PI) / 180;
    const cosMotor = Math.cos(motorAngle);
    const sinMotor = Math.sin(motorAngle);
    const motorX = forwardX * cosMotor + rightX * sinMotor;
    const motorY = forwardY * cosMotor + rightY * sinMotor;

    const maxThrust =
      this.currentThrustFraction >= 0
        ? this.maxThrustForward
        : this.maxThrustReverse;
    const thrustMagnitude = this.currentThrustFraction * maxThrust;

    const thrustX = motorX * thrustMagnitude;
    const thrustY = motorY * thrustMagnitude;

    // Split current velocity into hull-relative forward/lateral components
    const forwardVelocity = this.vx * forwardX + this.vy * forwardY;
    const lateralVelocity = this.vx * rightX + this.vy * rightY;

    const forwardDragForce =
      -Math.sign(forwardVelocity) *
      (this.forwardLinearDrag * Math.abs(forwardVelocity) +
        this.forwardQuadraticDrag * forwardVelocity ** 2);

    const lateralDragForce =
      -Math.sign(lateralVelocity) *
      (this.lateralLinearDrag * Math.abs(lateralVelocity) +
        this.lateralQuadraticDrag * lateralVelocity ** 2);

    const forceX =
      thrustX + forwardX * forwardDragForce + rightX * lateralDragForce;
    const forceY =
      thrustY + forwardY * forwardDragForce + rightY * lateralDragForce;

    // F = ma
    this.vx += (forceX / this.mass) * dt;
    this.vy += (forceY / this.mass) * dt;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    const motorWorldX = forwardX * -this.motorDistance;
    const motorWorldY = forwardY * -this.motorDistance;
    const torque = motorWorldX * thrustY - motorWorldY * thrustX;

    const angularDragTorque =
      -Math.sign(this.angularVelocity) *
      (this.angularLinearDrag * Math.abs(this.angularVelocity) +
        this.angularQuadraticDrag * this.angularVelocity ** 2);

    const angularAcceleration =
      (torque + angularDragTorque) / this.momentOfInertia;

    this.angularVelocity += angularAcceleration * dt;
    this.heading -= this.angularVelocity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < -144) this.x = this.maxX + 144;
    if (this.y < -144) this.y = this.maxY + 144;
    if (this.x > this.maxX + 144) this.x = -144;
    if (this.y > this.maxY + 144) this.y = -144;
  }

  render() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.boat.style.transform = `rotate(${this.heading}deg)`;
    this.motor.style.transform = `rotate(${
      -this.currentSteerFraction * this.maxSteerAngle
    }deg)`;
  }
}

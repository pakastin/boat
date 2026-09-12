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

    this.throttle = 0;
    this.steer = 0;

    this.maxSpeed = 150;
    this.thrust = 50;
    this.maxSteerAngle = 30;
    this.motorDistance = 59.5;
    this.forwardDrag = 0.2;
    this.minLateralDrag = 0.1;
    this.maxLateralDrag = 5;
    this.angularDrag = 0.4;

    this.motor = this.el.querySelector("rect");
    this.motor.style.transformOrigin = `${62 + 6}px ${121 + 10.5}px`;
  }

  update() {
    const dt = 1 / 60;

    const heading = (this.heading * Math.PI) / 180;
    const forwardX = Math.sin(heading);
    const forwardY = -Math.cos(heading);
    const rightX = Math.cos(heading);
    const rightY = Math.sin(heading);
    const motorAngle = (this.steer * this.maxSteerAngle * Math.PI) / 180;
    const cosMotor = Math.cos(motorAngle);
    const sinMotor = Math.sin(motorAngle);
    const motorX = forwardX * cosMotor + rightX * sinMotor;
    const motorY = forwardY * cosMotor + rightY * sinMotor;
    const thrustX = motorX * this.throttle * this.thrust;
    const thrustY = motorY * this.throttle * this.thrust;

    this.vx += thrustX * dt;
    this.vy += thrustY * dt;

    const speed = Math.hypot(this.vx, this.vy);

    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;

      this.vx *= scale;
      this.vy *= scale;
    }

    const forwardVelocity = this.vx * forwardX + this.vy * forwardY;
    const lateralVelocity = this.vx * rightX + this.vy * rightY;

    const speedRatio = Math.min(Math.abs(forwardVelocity) / this.maxSpeed, 1);

    const lateralDrag =
      this.minLateralDrag +
      (this.maxLateralDrag - this.minLateralDrag) * speedRatio;

    const forwardVelocityAfterDrag =
      forwardVelocity * Math.exp(-this.forwardDrag * dt);

    const lateralVelocityAfterDrag =
      lateralVelocity * Math.exp(-lateralDrag * dt);

    this.vx =
      forwardX * forwardVelocityAfterDrag + rightX * lateralVelocityAfterDrag;
    this.vy =
      forwardY * forwardVelocityAfterDrag + rightY * lateralVelocityAfterDrag;

    const motorWorldX = forwardX * -this.motorDistance;
    const motorWorldY = forwardY * -this.motorDistance;

    const torque = motorWorldX * thrustY - motorWorldY * thrustX;
    const rotationalResponse = 0.02;

    this.angularVelocity += torque * rotationalResponse * dt;
    this.angularVelocity *= Math.exp(-this.angularDrag * dt);
    this.heading -= this.angularVelocity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < -144) {
      this.x = this.maxX + 144;
    }

    if (this.y < -144) {
      this.y = this.maxY + 144;
    }

    if (this.x > this.maxX + 144) {
      this.x = -144;
    }

    if (this.y > this.maxY + 144) {
      this.y = -144;
    }
  }

  render() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;

    this.boat.style.transform = `rotate(${this.heading}deg)`;

    this.motor.style.transform = `rotate(${
      -this.steer * this.maxSteerAngle
    }deg)`;
  }
}

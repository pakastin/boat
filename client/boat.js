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

    this.mass = 2.2;
    this.momentOfInertia = 150;

    this.maxThrustForward = 260;
    this.maxThrustReverse = 120;
    this.engineResponse = 5;
    this.currentThrustFraction = 0;

    this.maxSteerAngle = 35;
    this.motorDistance = 29.75;
    this.steerResponse = 8;
    this.currentSteerFraction = 0;

    this.hullSpeed = 90;
    this.planingSpeed = 130;
    this.displacementDrag = 0.5;
    this.humpDragMultiplier = 2.5;
    this.planingDrag = 0.15;
    this.forwardQuadraticDrag = 0.0022;

    this.lateralLinearDrag = 25;
    this.lateralQuadraticDrag = 0.5;

    this.angularLinearDrag = 90;
    this.angularQuadraticDrag = 4;

    this.maxSpeed = 500;

    this.motor = this.el.querySelector("rect");
    this.motor.style.transformOrigin = `${31 + 3}px ${60.5 + 5.25}px`;

    this.speed = 0;
  }

  getForwardDragCoefficient(forwardSpeed) {
    const s = Math.abs(forwardSpeed);

    if (s <= this.hullSpeed) {
      const t = s / this.hullSpeed;
      return this.displacementDrag * (1 + this.humpDragMultiplier * t ** 3);
    }

    if (s <= this.planingSpeed) {
      const t = (s - this.hullSpeed) / (this.planingSpeed - this.hullSpeed);
      const peakDrag = this.displacementDrag * (1 + this.humpDragMultiplier);
      return peakDrag + (this.planingDrag - peakDrag) * t;
    }

    return this.planingDrag;
  }

  update() {
    const dt = 1 / 60;

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

    const forwardVelocity = this.vx * forwardX + this.vy * forwardY;
    const lateralVelocity = this.vx * rightX + this.vy * rightY;

    const forwardDragCoeff = this.getForwardDragCoefficient(forwardVelocity);
    const forwardDragForce =
      -Math.sign(forwardVelocity) *
      (forwardDragCoeff * Math.abs(forwardVelocity) +
        this.forwardQuadraticDrag * forwardVelocity ** 2);

    const lateralDragForce =
      -Math.sign(lateralVelocity) *
      (this.lateralLinearDrag * Math.abs(lateralVelocity) +
        this.lateralQuadraticDrag * lateralVelocity ** 2);

    const forceX =
      thrustX + forwardX * forwardDragForce + rightX * lateralDragForce;
    const forceY =
      thrustY + forwardY * forwardDragForce + rightY * lateralDragForce;

    this.vx += (forceX / this.mass) * dt;
    this.vy += (forceY / this.mass) * dt;

    const speed = (this.speed = Math.hypot(this.vx, this.vy));
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

    if (this.x < -72) this.x = this.maxX;
    if (this.y < -72) this.y = this.maxY;
    if (this.x > this.maxX) this.x = -72;
    if (this.y > this.maxY) this.y = -72;
  }

  render() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.boat.style.transform = `rotate(${this.heading}deg)`;
    this.motor.style.transform = `rotate(${
      -this.currentSteerFraction * this.maxSteerAngle
    }deg)`;
  }
}

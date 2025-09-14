export class Car {
  #brand;
  #model;

  constructor(brand, model) {
    this.#brand = brand;
    this.#model = model;
    this.speed = 0;
    this.isTrunkOpen = false;
  }

  displayInfo() {
    const trunkStatus = this.isTrunkOpen ? "open" : "close";
    console.log(`${this.#brand} ${this.#model}, Speed: ${this.speed} km/h, Trunk: ${trunkStatus}`);
  }


go() {
  this.speed += 5;
  if (this.speed > 200) {
    this.speed = 200;
  }
}

brake() {
  this.speed -= 5; 
    if (this.speed < 0) {
      this.speed = 0;
    }
  }

openTrunk() {
  if (this.speed === 0) {
    this.isTrunkOpen = true;
  } else {
    console.log("Trunk can only be opened when stationary!");
  }
}

closeTrunk() {
  this.isTrunkOpen = false;
  }

  get brand() {
    return this.#brand;
  }
  get model() {
    return this.#model;
  }
}

export class RaceCar extends Car {
  constructor(brand, model, acceleration) {
    super(brand, model);
    this.acceleration = acceleration;
  }

  go() {
    this.speed += this.acceleration;
    if (this.speed > 300) {
      this.speed = 300;
    }
  }

  openTrunk() {
    console.log("Racing cars don't have a trunk!");
  }

  closeTrunk() {
    console.log("Racing cars don't have a trunk!");
  }
}

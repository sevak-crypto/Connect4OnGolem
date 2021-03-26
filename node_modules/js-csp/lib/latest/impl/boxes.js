

export class Box {

  constructor(value) {
    this.value = value;
  }
}


export class PutBox {

  constructor(handler, value) {
    this.handler = handler;
    this.value = value;
  }
}
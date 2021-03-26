import { Channel } from './channels';

export class TakeInstruction {

  constructor(channel) {
    this.channel = channel;
  }
}

export class PutInstruction {

  constructor(channel, value) {
    this.channel = channel;
    this.value = value;
  }
}

export class SleepInstruction {

  constructor(msec) {
    this.msec = msec;
  }
}

export class AltsInstruction {

  constructor(operations, options) {
    this.operations = operations;
    this.options = options;
  }
}
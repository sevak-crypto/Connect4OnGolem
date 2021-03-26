import { Channel } from './channels';

export const DEFAULT = {
  toString() {
    return '[object DEFAULT]';
  }
};

export class AltResult {

  constructor(value, channel) {
    this.value = value;
    this.channel = channel;
  }
}
import { run } from './dispatch';


export const taskScheduler = (func, value) => {
  run(() => func(value));
};

export const isReduced = v => v && v['@@transducer/reduced'];

export function flush(channelBuffer, callback) {
  while (channelBuffer.length > 0) {
    callback(channelBuffer.pop());
  }
}
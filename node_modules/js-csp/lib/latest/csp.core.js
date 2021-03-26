
import { fixed, promise } from './impl/buffers';

import { putThenCallback, Process } from './impl/process';
import { chan as channel, Channel, CLOSED } from './impl/channels';

export function spawn(gen) {
  const ch = channel(fixed(1));
  const process = new Process(gen, value => {
    if (value === CLOSED) {
      ch.close();
    } else {
      putThenCallback(ch, value, () => ch.close());
    }
  });

  process.run();
  return ch;
}

export function go(f, args = []) {
  return spawn(f(...args));
}

export function chan(bufferOrNumber, xform, exHandler) {
  if (typeof bufferOrNumber === 'number') {
    return channel(bufferOrNumber === 0 ? null : fixed(bufferOrNumber), xform, exHandler);
  }

  return channel(bufferOrNumber, xform, exHandler);
}

export function promiseChan(xform, exHandler) {
  return channel(promise(), xform, exHandler);
}
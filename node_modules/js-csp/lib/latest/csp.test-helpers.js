import mocha from 'mocha';
import { chan, go as goroutine, put, take } from './csp';

export const identityChan = x => {
  const ch = chan(1);

  goroutine(function* () {
    yield put(ch, x);
    ch.close();
  });

  return ch;
};

export const check = (f, done) => {
  try {
    f();
    done();
  } catch (e) {
    done(e);
  }
};

export const goAsync = f => done => {
  goroutine(f, [done]);
};

export const go = f => done => {
  goroutine(function* () {
    try {
      const ch = goroutine(f, []);
      yield take(ch);
      done();
    } catch (e) {
      done(e);
    }
  });
};

// f must be a generator function. For now assertions should be inside f's
// top-level, not functions f may call (that works but a failing test
// may break following tests).
export const it = (desc, f) => mocha.it(desc, go(f));

export const beforeEach = f => mocha.beforeEach(go(f));

export const afterEach = f => mocha.afterEach(go(f));

export const before = f => mocha.before(go(f));

export const after = f => mocha.after(go(f));
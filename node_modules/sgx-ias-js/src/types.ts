export const LITTLE_ENDIAN = true;

export type u8 = number & { _U8: void; };
export type u16 = number & { _U16: void; };
export type u32 = number & { _U32: void; };
export type u64 = bytes.Bytes8 & { _U64: void; };

export const toU8 = (n: number): u8 =>  (n & 0xff) as u8;
export const toU16 = (n: number): u16 => (n & 0xffff) as u16;
export const toU32 = (n: number): u32 => (n & 0xffffffff) as u32;
// store number or array as 8 bytes little-endian
export const toU64 = (src: number | Uint8Array): u64 => {
    let buf: Uint8Array;
    if (typeof src == "number") {
        buf = new Uint8Array(8);
        new DataView(buf.buffer, 0).setUint32(0, src & 0xffffffff, true);
    } else {
        buf = src;
    }
    return bytes.Bytes8.from(buf) as u64;
};
// check for flags presence
export const u64Flag = (l: u64, r: u64): boolean => {
    let li = l.inner;
    let ri = r.inner;
    let len = Math.min(li.length, ri.length);
    for (let i = 0; i < len; ++i) {
        if ((li[i] & ri[i]) != ri[i]) return false;
    }
    return true;
};

export const toHex = (arr: Uint8Array): string => {
    const map = (x: { toString: (arg0: number) => string; }) => ('00' + x.toString(16)).slice(-2);
    return Array.prototype.map.call(arr, map).join('');
}

export const parseHex = (str: string): Uint8Array => {
    let arr = str.replace(/../g, '$&_')
        .slice(0, -1)
        .split('_')
        .map(h => parseInt (h, 16));
    return new Uint8Array(arr);
};

export namespace bytes {
    export class Bytes {
        static size: number = 0;
        inner!: Uint8Array;

        protected constructor(arr: Uint8Array) {
            this.inner = arr;
        }

        static default(): Bytes {
            return new Bytes(new Uint8Array(this.size));
        }

        static from(arr: Uint8Array, offset: number = 0): Bytes {
            let slice = arr.slice(offset, offset + this.size);
            if (slice.byteLength == this.size) {
                return new Bytes(slice);
            }
            throw new Error(`Invalid length: ${arr.byteLength} != ${this.size} (expected)`);
        }

        static fromHex(hex: string): Bytes {
            let arr = parseHex(hex);
            if (arr.byteLength != bytes.Bytes32.size) {
                throw new Error("Invalid measurement byte length");
            }
            return bytes.Bytes32.from(arr);
        }

        eq(other: Bytes): boolean {
            if (this.inner.length != other.inner.length) {
                return false;
            }
            for (let i = 0; i < this.inner.length; ++i) {
                if (this.inner[i] != other.inner[i]) return false;
            }
            return true;
        }

        partialEq(other: Uint8Array): boolean {
            let len = Math.min(this.inner.length, other.length);
            for (let i = 0; i < len; ++i) {
                if (this.inner[i] != other[i]) return false;
            }
            return true;
        }

        into(): Uint8Array {
            return this.inner;
        }

        toString(radix: number = 16): string {
            if (radix != 16) {
                throw new Error(`Unsupported radix: ${radix}`);
            }
            return toHex(this.inner);
        }
    }

    export class Bytes2 extends Bytes { static size = 2; }
    export class Bytes4 extends Bytes { static size = 4; }
    export class Bytes8 extends Bytes { static size = 8; }
    export class Bytes12 extends Bytes { static size = 12; }
    export class Bytes16 extends Bytes { static size = 16; }
    export class Bytes32 extends Bytes { static size = 32; }
    export class Bytes42 extends Bytes { static size = 42; }
    export class Bytes64 extends Bytes { static size = 64; }
    export class Bytes384 extends Bytes { static size = 384; }
}

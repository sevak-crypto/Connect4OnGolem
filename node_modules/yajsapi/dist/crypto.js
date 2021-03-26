"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoCtx = exports.PublicKey = exports.PrivateKey = exports.rand_hex = void 0;
const crypto = __importStar(require("crypto"));
const eccrypto = __importStar(require("eccrypto"));
const secp256k1 = __importStar(require("secp256k1"));
function rand_hex(length) {
    let byte_sz = Math.floor(length / 2);
    return crypto.randomBytes(byte_sz).toString("hex");
}
exports.rand_hex = rand_hex;
class PrivateKey {
    constructor() {
        this.inner = eccrypto.generatePrivate();
    }
    static from(buffer) {
        let key = Object.create(this.prototype);
        key.inner = buffer;
        return key;
    }
    static fromHex(hex) {
        let inner = Buffer.from(hex, "hex");
        return PublicKey.from(inner);
    }
    publicKey(compressed = true) {
        let buffer = compressed
            ? eccrypto.getPublicCompressed(this.inner)
            : eccrypto.getPublic(this.inner);
        return PublicKey.from(buffer);
    }
    async derive(publicKey) {
        return await eccrypto.derive(this.inner, publicKey.inner);
    }
    async sign(msg) {
        return await eccrypto.sign(this.inner, msg);
    }
    toString() {
        return this.inner.toString("hex");
    }
}
exports.PrivateKey = PrivateKey;
class PublicKey {
    constructor() { }
    static from(buffer) {
        let key = Object.create(this.prototype);
        key.inner = buffer;
        return key;
    }
    static fromHex(hex) {
        let inner = Buffer.from(hex, "hex");
        return PublicKey.from(inner);
    }
    toString() {
        return this.inner.toString("hex");
    }
}
exports.PublicKey = PublicKey;
class CryptoCtx {
    constructor(priv_key, ephem_key) {
        this.priv_key = priv_key;
        this.ephem_key = ephem_key;
    }
    static async from(pub_key, priv_key) {
        priv_key = priv_key ? priv_key : new PrivateKey();
        let ephem_key = Buffer.from(secp256k1.ecdh(pub_key.inner, priv_key.inner));
        return new CryptoCtx(priv_key, ephem_key);
    }
    encrypt(data) {
        let iv = crypto.randomBytes(12);
        let cipher = crypto.createCipheriv("aes-256-gcm", this.ephem_key, iv);
        let chunk_1 = cipher.update(data);
        let chunk_2 = cipher.final();
        let tag = cipher.getAuthTag();
        let buffer = Buffer.alloc(1 + iv.length + 1 + tag.length, 0, 'binary');
        let off = 0;
        buffer.writeUInt8(iv.length, off);
        off += 1;
        iv.copy(buffer, off);
        off += iv.length;
        buffer.writeUInt8(tag.length, off);
        off += 1;
        tag.copy(buffer, off);
        return Buffer.concat([buffer, chunk_1, chunk_2]);
    }
    decrypt(data) {
        let off = 0;
        let iv_length = data.readUInt8(off);
        off += 1;
        let iv = data.slice(off, off + iv_length);
        off += iv_length;
        let tag_length = data.readUInt8(off);
        off += 1;
        let tag = data.slice(off, off + tag_length);
        off += tag_length;
        let enc = data.slice(off);
        var cipher = crypto.createDecipheriv("aes-256-gcm", this.ephem_key, iv);
        cipher.setAuthTag(tag);
        return Buffer.concat([cipher.update(enc), cipher.final()]);
    }
}
exports.CryptoCtx = CryptoCtx;
//# sourceMappingURL=crypto.js.map
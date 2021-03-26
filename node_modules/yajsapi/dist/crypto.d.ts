/// <reference types="node" />
export declare function rand_hex(length: number): string;
export declare class PrivateKey {
    inner: Buffer;
    constructor();
    static from(buffer: Buffer): PrivateKey;
    static fromHex(hex: string): PublicKey;
    publicKey(compressed?: boolean): PublicKey;
    derive(publicKey: PublicKey): Promise<Buffer>;
    sign(msg: Buffer): Promise<Buffer>;
    toString(): string;
}
export declare class PublicKey {
    inner: Buffer;
    private constructor();
    static from(buffer: Buffer): PublicKey;
    static fromHex(hex: string): PublicKey;
    toString(): string;
}
export declare class CryptoCtx {
    priv_key: PrivateKey;
    ephem_key: Buffer;
    static from(pub_key: PublicKey, priv_key?: PrivateKey): Promise<CryptoCtx>;
    private constructor();
    encrypt(data: Buffer): Buffer;
    decrypt(data: Buffer): Buffer;
}

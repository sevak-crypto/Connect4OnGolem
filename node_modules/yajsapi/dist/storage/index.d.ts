/// <reference types="node" />
export declare class Content {
    length: number;
    stream: any;
    constructor(length: any, stream: any);
    from_reader(length: number, s: any): Content;
}
export declare class Source {
    download_url(): string;
    content_length(): Promise<number>;
}
export declare class Destination {
    upload_url(): string;
    download_stream(): Promise<Content>;
    download_file(destination_file: string): Promise<void>;
}
export declare class InputStorageProvider {
    upload_stream(length: number, stream: AsyncGenerator<Buffer>): Promise<Source>;
    upload_bytes(data: Buffer): Promise<Source>;
    upload_file(path: string): Promise<Source>;
}
export declare class OutputStorageProvider {
    new_destination(destination_file?: string | null): Promise<Destination>;
}
export interface StorageProvider extends InputStorageProvider, OutputStorageProvider {
}
export declare class StorageProvider {
}
export declare class ComposedStorageProvider implements StorageProvider {
    private _input;
    private _output;
    constructor(input_storage: InputStorageProvider, output_storage: OutputStorageProvider);
    upload_bytes(data: Buffer): Promise<Source>;
    upload_stream(length: number, stream: AsyncGenerator<Buffer>): Promise<Source>;
    upload_file(path: string): Promise<Source>;
    new_destination(destination_file?: string | null): Promise<Destination>;
}

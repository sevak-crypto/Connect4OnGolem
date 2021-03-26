"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposedStorageProvider = exports.StorageProvider = exports.OutputStorageProvider = exports.InputStorageProvider = exports.Destination = exports.Source = exports.Content = void 0;
const utils_1 = require("../utils");
const fs = require("fs");
const _BUF_SIZE = 40960;
class Content {
    constructor(length, stream) {
        this.length = length;
        this.stream = stream;
    }
    from_reader(length, s) {
        async function* stream() {
            for await (const chunk of s) {
                yield chunk;
            }
        }
        return new Content(length, stream());
    }
}
exports.Content = Content;
class Source {
    download_url() {
        throw "NotImplementedError";
    }
    async content_length() {
        throw "NotImplementedError";
    }
}
exports.Source = Source;
class Destination {
    upload_url() {
        throw "NotImplementedError";
    }
    async download_stream() {
        throw "NotImplementedError";
    }
    async download_file(destination_file) {
        let content = await this.download_stream();
        var writableStream = fs.createWriteStream(destination_file, {
            encoding: "binary",
        });
        await new Promise(async (fulfill) => {
            writableStream.once("finish", fulfill);
            for await (let chunk of content.stream) {
                writableStream.write(chunk);
            }
            writableStream.end();
        });
    }
}
exports.Destination = Destination;
class InputStorageProvider {
    async upload_stream(length, stream) {
        throw "NotImplementedError";
    }
    async upload_bytes(data) {
        async function* _inner() {
            yield data;
        }
        return await this.upload_stream(data.length, _inner());
    }
    async upload_file(path) {
        let file_size = fs.statSync(path)["size"];
        async function* read_file() {
            const stream = fs.createReadStream(path, {
                highWaterMark: _BUF_SIZE,
                encoding: "binary",
            });
            stream.once("end", () => {
                stream.destroy();
            });
            for await (let chunk of stream) {
                yield chunk;
            }
        }
        return await this.upload_stream(file_size, read_file());
    }
}
exports.InputStorageProvider = InputStorageProvider;
class OutputStorageProvider {
    async new_destination(destination_file = null) {
        throw "NotImplementedError";
    }
}
exports.OutputStorageProvider = OutputStorageProvider;
class StorageProvider {
}
exports.StorageProvider = StorageProvider;
utils_1.applyMixins(StorageProvider, [InputStorageProvider, OutputStorageProvider]);
class ComposedStorageProvider {
    constructor(input_storage, output_storage) {
        this._input = input_storage;
        this._output = output_storage;
    }
    upload_bytes(data) {
        throw new Error("Method not implemented.");
    }
    async upload_stream(length, stream) {
        return await this._input.upload_stream(length, stream);
    }
    async upload_file(path) {
        return await this._input.upload_file(path);
    }
    async new_destination(destination_file = null) {
        return await this._output.new_destination(destination_file);
    }
}
exports.ComposedStorageProvider = ComposedStorageProvider;
//# sourceMappingURL=index.js.map
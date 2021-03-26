"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const log_1 = __importDefault(require("./log"));
bluebird_1.default.Promise.config({ cancellation: true });
function get_event_loop() {
    return {
        create_task: bluebird_1.default.coroutine(function* (fn) {
            return yield new bluebird_1.default.Promise(async (resolve, reject, onCancel) => {
                try {
                    let result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
                if (onCancel)
                    onCancel(() => {
                        log_1.default.warn("cancelled!");
                        reject("cancelled!");
                    });
            });
        }),
    };
}
exports.default = get_event_loop;
//# sourceMappingURL=eventLoop.js.map
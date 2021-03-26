"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    constructor(parent) {
        if (parent)
            this._parent = parent;
        this._cancelled = false;
    }
    get cancelled() {
        return (this._cancelled ||
            (this._cancelled = this._parent ? this._parent.cancelled : false));
    }
    cancel() {
        this._cancelled = true;
    }
}
exports.default = Token;
//# sourceMappingURL=cancellationToken.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function applyMixins(derivedCtor, constructors) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || "");
        });
    });
}
exports.default = applyMixins;
//# sourceMappingURL=applyMixins.js.map
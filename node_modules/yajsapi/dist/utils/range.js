"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function range(start, end, step = 1) {
    let list = [];
    for (let index = start; index < end; index += step)
        list.push(index);
    return list;
}
exports.default = range;
//# sourceMappingURL=range.js.map
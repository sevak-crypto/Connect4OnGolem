"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAllProperties(obj) {
    var allProps = [], curr = obj;
    do {
        var props = Object.getOwnPropertyNames(curr);
        props.forEach(function (prop) {
            if (allProps.indexOf(prop) === -1)
                allProps.push(prop);
        });
    } while ((curr = Object.getPrototypeOf(curr)));
    return allProps;
}
exports.default = getAllProperties;
//# sourceMappingURL=getAllProperties.js.map
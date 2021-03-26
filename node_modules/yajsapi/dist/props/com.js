"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComLinear = exports.Com = exports.Counter = exports.PriceModel = exports.BillingScheme = exports.DEFINED_USAGES = exports.LINEAR_COEFFS = exports.PRICE_MODEL = exports.SCHEME = void 0;
const base_1 = require("./base");
exports.SCHEME = "golem.com.scheme";
exports.PRICE_MODEL = "golem.com.pricing.model";
exports.LINEAR_COEFFS = "golem.com.pricing.model.linear.coeffs";
exports.DEFINED_USAGES = "golem.com.usage.vector";
var BillingScheme;
(function (BillingScheme) {
    BillingScheme["PAYU"] = "payu";
})(BillingScheme = exports.BillingScheme || (exports.BillingScheme = {}));
var PriceModel;
(function (PriceModel) {
    PriceModel["LINEAR"] = "linear";
})(PriceModel = exports.PriceModel || (exports.PriceModel = {}));
var Counter;
(function (Counter) {
    Counter["TIME"] = "golem.usage.duration_sec";
    Counter["CPU"] = "golem.usage.cpu_sec";
    Counter["STORAGE"] = "golem.usage.storage_gib";
    Counter["MAXMEM"] = "golem.usage.gib";
    Counter["UNKNOWN"] = "";
})(Counter = exports.Counter || (exports.Counter = {}));
class Com extends base_1.Model {
    constructor() {
        super(...arguments);
        this.scheme = new base_1.Field({ metadata: { key: exports.SCHEME } });
        this.price_model = new base_1.Field({ metadata: { key: exports.PRICE_MODEL } });
    }
}
exports.Com = Com;
class ComLinear extends Com {
    _custom_mapping(props, data) {
        if (data["price_model"] != PriceModel.LINEAR)
            throw "expected linear pricing model";
        let coeffs = base_1.as_list(props[exports.LINEAR_COEFFS]);
        let usages = base_1.as_list(props[exports.DEFINED_USAGES]);
        let fixed_price = parseFloat(coeffs.pop() || "0");
        let price_for = {};
        for (let i = 0; i < coeffs.length; i++) {
            price_for = { ...price_for, [usages[i]]: parseFloat(coeffs[i]) };
        }
        data.fixed_price = fixed_price;
        data.price_for = price_for;
    }
}
exports.ComLinear = ComLinear;
//# sourceMappingURL=com.js.map
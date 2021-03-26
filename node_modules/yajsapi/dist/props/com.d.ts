import { Model, Field } from "./base";
export declare const SCHEME: string;
export declare const PRICE_MODEL: string;
export declare const LINEAR_COEFFS: string;
export declare const DEFINED_USAGES: string;
export declare enum BillingScheme {
    PAYU = "payu"
}
export declare enum PriceModel {
    LINEAR = "linear"
}
export declare enum Counter {
    TIME = "golem.usage.duration_sec",
    CPU = "golem.usage.cpu_sec",
    STORAGE = "golem.usage.storage_gib",
    MAXMEM = "golem.usage.gib",
    UNKNOWN = ""
}
export declare class Com extends Model {
    scheme: Field;
    price_model: Field;
}
export declare class ComLinear extends Com {
    fixed_price: number;
    price_for: Object;
    _custom_mapping(props: any, data: any): void;
}

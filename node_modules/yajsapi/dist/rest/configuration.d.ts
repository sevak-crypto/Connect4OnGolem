import { yaActivity, yaMarket, yaPayment } from "ya-ts-client";
export declare class Configuration {
    private __app_key;
    private __url;
    private __market_url;
    private __payment_url;
    private __activity_url;
    private __axios_opts;
    constructor(app_key?: null, url?: string, market_url?: string, payment_url?: string, activity_url?: string);
    app_key(): string | null;
    market_url(): string | null;
    payment_url(): string;
    activity_url(): string;
    market(): yaMarket.Configuration;
    payment(): yaPayment.Configuration;
    activity(): yaActivity.Configuration;
}

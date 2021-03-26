"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const ya_ts_client_1 = require("ya-ts-client");
const http_1 = require("http");
const https_1 = require("https");
const DEFAULT_API_URL = "http://127.0.0.1:7465";
class MissingConfiguration extends Error {
    constructor(key, description) {
        super(description);
        this.name = key;
    }
}
function env_or_fail(key, description) {
    let val = process.env[key];
    if (!val)
        throw new MissingConfiguration(key, description);
    return val;
}
class Configuration {
    constructor(app_key = null, url, market_url, payment_url, activity_url) {
        this.__app_key =
            app_key || env_or_fail("YAGNA_APPKEY", "API authentication token");
        this.__url = url || DEFAULT_API_URL;
        const resolve_url = (given_url, env_val, prefix) => {
            return (given_url || process.env[env_val] || `${this.__url}${prefix}`);
        };
        this.__market_url = resolve_url(market_url, "YAGNA_MARKET_URL", "/market-api/v1");
        this.__payment_url = resolve_url(payment_url, "YAGNA_PAYMENT_URL", "/payment-api/v1");
        this.__activity_url = resolve_url(activity_url, "YAGNA_ACTIVITY_URL", "/activity-api/v1");
        this.__axios_opts = {
            httpAgent: new http_1.Agent({
                keepAlive: true,
            }),
            httpsAgent: new https_1.Agent({
                keepAlive: true,
            }),
        };
    }
    app_key() {
        return this.__app_key;
    }
    market_url() {
        return this.__market_url;
    }
    payment_url() {
        return this.__payment_url;
    }
    activity_url() {
        return this.__activity_url;
    }
    market() {
        let cfg = new ya_ts_client_1.yaMarket.Configuration({
            apiKey: this.app_key(),
            basePath: this.__market_url,
            accessToken: this.app_key(),
            baseOptions: this.__axios_opts,
        });
        return cfg;
    }
    payment() {
        let cfg = new ya_ts_client_1.yaPayment.Configuration({
            apiKey: this.app_key(),
            basePath: this.__payment_url,
            accessToken: this.app_key(),
            baseOptions: this.__axios_opts,
        });
        return cfg;
    }
    activity() {
        let cfg = new ya_ts_client_1.yaActivity.Configuration({
            apiKey: this.app_key(),
            basePath: this.__activity_url,
            accessToken: this.app_key(),
            baseOptions: this.__axios_opts,
        });
        return cfg;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map
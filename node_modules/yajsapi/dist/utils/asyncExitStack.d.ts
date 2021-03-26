export default class AsyncExitStack {
    private _stack;
    enter_async_context(ctx: any): Promise<any>;
    aclose(): Promise<void>;
}

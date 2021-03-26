import { Callable } from ".";
export default class AsyncWrapper {
    private _wrapped;
    private _args_buffer;
    private _task;
    private _loop;
    private _cancellationToken;
    constructor(wrapped: Callable<any, any>, event_loop: any, cancellationToken: any);
    _worker(): Promise<void>;
    ready(): Promise<void>;
    done(): Promise<void>;
    async_call(): void;
}

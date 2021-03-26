export default class Token {
    private _parent;
    private _cancelled;
    constructor(parent?: any);
    get cancelled(): boolean;
    cancel(): void;
}

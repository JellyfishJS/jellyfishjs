/**
 * Holds an array of callbacks,
 * and calls them when `.callHandlers` is called.
 */
export class Handler<Args extends readonly []> {

    /**
     * The callbacks that have been added to this Handler.
     */
    private _callbacks: ((...args: Args) => void)[] = [];

    /**
     * Adds a callback to this Handler,
     * which will be called when `.callHandlers` is called.
     */
    public addCallback(callback: (...args: Args) => void) {
        this._callbacks.push(callback);
    }

    /**
     * Calls all the callbacks in this Handler.
     */
    public callCallback(...args: Args) {
        this._callbacks.forEach((callback) => callback(...args));
    }

}

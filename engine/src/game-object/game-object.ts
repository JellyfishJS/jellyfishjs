import { Handler } from "./handler";

/**
 * The superclass of any objects that appear in the game.
 */
export class GameObject {

    /**
     * Keeps track of the functions to call on creation.
     */
    private _onCreateHandler = new Handler();

    /**
     * Calls the specified callback when the object is created.
     */
    public onCreate(callback: () => void) {
        this._onCreateHandler.addCallback(callback);
    }

    /**
     * Keeps track of the functions to call on step.
     */
    private _onStepHandler = new Handler();

    /**
     * Calls the specified callback when the object is created.
     */
    public onStep(callback: () => void) {
        this._onStepHandler.addCallback(callback);
    }

}

/**
 * Initializes an instance of the specified class with the specified arguments.
 *
 * Adds appropriately named functions to the handlers if they exist.
 */
export function initializeGameObject<Class extends GameObject, Args extends readonly []>(
    Class: new (...args: Args) => Class,
    ...args: Args
) {
    const newObject = new Class(...args);
    const newObjectAsAny = newObject as any;

    if (typeof newObjectAsAny["create"] === "function") {
        newObjectAsAny.onCreate(newObjectAsAny["create"]);
    }

    if (typeof newObjectAsAny["step"] === "function") {
        newObjectAsAny.onCreate(newObjectAsAny["step"]);
    }

    return newObject;
}

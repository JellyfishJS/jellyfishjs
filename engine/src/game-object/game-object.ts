import { Handler } from "./handler";

/**
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject {

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
     * Calls the specified callback every step.
     */
    public onStep(callback: () => void) {
        this._onStepHandler.addCallback(callback);
    }

    /**
     * Called when the object is created.
     */
    public create?(): void;

    /**
     * Called every step.
     */
    public step?(): void;

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

    if (newObject.create) {
        newObject.onCreate(newObject.create);
    }

    if (newObject.step) {
        newObject.onStep(newObject.step);
    }

    return newObject;
}

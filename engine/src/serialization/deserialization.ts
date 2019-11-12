import { SerializableObject, SerializationResult } from './serialization-result';

/**
 * A class used to deserialize a single object.
 *
 * This is basically just a method,
 * but it's it in its own class
 * because it caches many things
 * and this makes it easier.
 */
export class Deserialization {

    /**
     * Makes a deserialization for the specified serialization.
     */
    public constructor(object: SerializationResult) {
        this._originalObject = object;
    }

    /**
     * Gets the deserialization of the object passed in to the constructor.
     *
     * Caches its result,
     * so don't modify the object and expect a different result.
     */
    public getDeserialization(): SerializableObject {
        if (!this._result) {
            this._runDeserialization();
        }

        return this._result!;
    }

    /**
     * The object this deserialization deserializes.
     */
    private readonly _originalObject: SerializationResult;

    /**
     * A cache of the result of the deserialization.
     */
    private _result: SerializableObject | undefined;

    /**
     * Deserializes the object passed in to the constructor.
     *
     * Caches things but does not check the caches.
     * Do not run twice,
     * or the results will be strange.
     */
    private _runDeserialization() {

    }

}

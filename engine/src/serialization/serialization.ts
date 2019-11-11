import { SerializationResult } from './serialization-result';

/**
 * A class used to serialize a single object.
 *
 * This is basically just a method,
 * but I put it in its own class
 * because it caches lots of stuff
 * and this makes it easier.
 */
export class Serialization {

    /**
     * Makes a serialization for the specified object.
     */
    public constructor(object: object) {
        this._originalObject = object;
    }

    /**
     * Returns a serialized version of the specified object.
     *
     * Caches its result,
     * so don't modify the object and expect to be able to reserialize it.
     */
    public getSerialization(): SerializationResult {
        if (!this._result) { this._result = this._getSerializationUncached(); }
        return this._result;
    }

    /**
     * The object this instance is serializing.
     *
     * Cannot be changed,
     * once an instance is serializing something,
     * that's the only thing it can serialize.
     */
    private readonly _originalObject: object;

    /**
     * A cache of the result of the serialization.
     */
    private _result: SerializationResult | undefined;

    /**
     * Serializes the object without caching the result.
     *
     * Do NOT call more than once.
     *
     * If this is called more than once,
     * then the saved intermediate results will still exist,
     * so it will not work correctly.
     */
    private _getSerializationUncached(): SerializationResult {
        return {
            rootObject: 'wow',
            objects: {},
        };
    }

}

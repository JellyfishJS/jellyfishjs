/**
 * The serialization of a single object.
 */
export interface SerializedObject {

}

/**
 * A serialization of some object.
 *
 * Compatible with JSON.
 */
export interface SerializationResult {
    rootObject: string;
    objects: {
        [uuid: string]: SerializedObject,
    };
}

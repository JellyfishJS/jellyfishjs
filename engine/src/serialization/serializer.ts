import { Deserialization } from './deserialization';
import { Serialization } from './serialization';
import { SerializableObject, SerializationResult } from './serialization-result';

/**
 * Serializes specified objects.
 *
 * Multiple instances can be used to use different configuration.
 */
export class Serializer {

    /**
     * Serializes the specified object.
     */
    public serialize(object: SerializableObject): SerializationResult {
        return new Serialization(object).getSerialization();
    }

    public deserialize(object: SerializationResult): SerializableObject {
        return new Deserialization(object).getDeserialization();
    }

}

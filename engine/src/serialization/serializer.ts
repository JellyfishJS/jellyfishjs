import { Serialization } from './serialization';
import { SerializationResult } from './serialization-result';

/**
 * Serializes specified objects.
 *
 * Multiple instances can be used to use different configuration.
 */
export class Serializer {

    /**
     * Serializes the specified object.
     */
    public serialize(object: object): SerializationResult {
        return new Serialization(object).getSerialization();
    }

}

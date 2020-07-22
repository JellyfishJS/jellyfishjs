import type { SerializableItem } from './serialization-result';
import type { PrototypeConfiguration } from './serializer-configuration';

/**
 * Returns `true` if the specified key of the specified item
 * is blacklisted.
 */
export function isKeyBlacklisted(
    key: string | symbol,
    item: SerializableItem,
    configurations: PrototypeConfiguration<unknown>[] = [],
): boolean {
    for (const configuration of configurations) {
        if (
            typeof configuration.blacklistedKeys === 'function'
            && configuration.blacklistedKeys(key, item)
        ) {
            return true;
        }

        if (
            configuration.blacklistedKeys instanceof Set
            && configuration.blacklistedKeys.has(key)
        ) {
            return true;
        }
    }

    return false;
}

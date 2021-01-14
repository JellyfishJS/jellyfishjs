export function someValue<K, V>(map: Map<K, V>, test: (value: V) => boolean): boolean {
    for (const [, value] of map) {
        if (test(value)) {
            return true;
        }
    }

    return false;
}

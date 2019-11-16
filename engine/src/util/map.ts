export function someValue<K, V>(map: Map<K, V>, test: (value: V) => boolean): boolean {
    for (const [key, value] of map) {
        if (test(value)) {
            return true;
        }
    }

    return false;
}

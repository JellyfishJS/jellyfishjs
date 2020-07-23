/* tslint:disable:no-bitwise */
const _fillRandom = typeof crypto === 'object' ?
    crypto.getRandomValues.bind(crypto) ||
    (crypto as any).randomFillSync.bind(crypto) : undefined;
const fillRandom = (_fillRandom as (buffer: Uint32Array) => void) || (function (buffer: Uint32Array) {
    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = (Math.random() * 0x1_0000_0000) | 0;
    }
});

function xorshift128(): () => number {
    const state = new Uint32Array(4);
    fillRandom(state);
    return function () {
        let t = state[3];
        const s = state[0];
        state[3] = state[2];
        state[2] = state[1];
        state[1] = state[0];
        t ^= t << 11;
        t ^= t >> 8;
        return state[0] = t ^ s ^ (s >> 19);
    };
}

export function xorshift128_16bytes(): () => number[] {
    const result = new Uint32Array(4);
    const byteView = new Uint8Array(result.buffer);
    const generator = xorshift128();
    return function () {
        for (let i = 0; i < 4; ++i) {
            result[i] = generator();
        }
        return [...byteView];
    };
}

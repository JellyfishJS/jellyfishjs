import { isServer } from '../multiplayer/is-server';

let _require;

if (!isServer) {
    _require = function () {
        throw new Error('Attempt to use node require in browser.');
    };
// @ts-ignore
} else if (typeof __non_webpack_require__ !== 'undefined') {
    // @ts-ignore
    _require = (module: string) => __non_webpack_require__(module);
} else {
    _require = (module: string) => require(module);
}

export const nodeRequire = _require;

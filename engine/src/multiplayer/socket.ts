import type * as SocketIOForType from 'socket.io';
import { nodeRequire } from '../util/require';
import { isServer } from './is-server';

/**
 * Returns the socket.io dependency if it is available,
 * otherwise undefined.
 */
export function getSocketIO(): typeof SocketIOForType | undefined {
    if (isServer) {
        // Typescript doesn't generate a require for the first import,
        // if it is re-required here.
        // This makes it not crash client-side,
        // since socket.io cannot be imported in the browser.
        // This makes webpack ignore this require.
        // @ts-ignore
        return nodeRequire('socket.io');
    }
}

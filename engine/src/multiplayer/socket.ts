import * as SocketIOForType from 'socket.io';
import { isServer } from './is-server';

export function getSocketIO(): typeof SocketIOForType | undefined {
    if (isServer) {
        return require('socket.io');
    }
}

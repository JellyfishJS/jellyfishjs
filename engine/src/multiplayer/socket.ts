import * as SocketIOForType from 'socket.io';
import { isServer } from './is-server';

let SocketIO: typeof SocketIOForType | undefined;

if (isServer) {
    SocketIO = require('socket.io');
}

export { SocketIO };

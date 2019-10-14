import * as SocketIOClient from 'socket.io-client';
import { GameObject } from '../game-object/game-object';
import { isServer } from './is-server';
import { Server } from './server';

/**
 * Represents a client-side connection to a server.
 *
 * Automatically syncs any child game objects with the server.
 */
export class Client extends GameObject {

    /**
     * Stores the socket.io client with which this client is connected to the server.
     */
    private _socketIOClient: SocketIOClient.Socket | undefined;

    /**
     * Connects this client to the server with the specified host and port.
     *
     * If no port is specified, defaults to `17771`.
     */
    public connect(host: string, port: number = Server.DEFAULT_PORT) {
        if (isServer) { return; }

        this._socketIOClient = SocketIOClient(`${host}:${port}`);

        this._socketIOClient.on('connect', () => {
            this.onConnect && this.onConnect();
        });

        this._socketIOClient.on('disconnect', (reason: string) => {
            this.onDisconnect && this.onDisconnect(reason);
        });

        this._socketIOClient.on('message', (type: unknown, contents: string) => {
            this._onMessage(type, contents);
        });
    }

    /**
     * Sends the specified message to the server.
     */
    public sendMessage(message: string) {
        if (!this._socketIOClient) { return; }

        this._socketIOClient.send('message', message);
    }

    /**
     * Handles a message from the server.
     *
     * If it's not formatted properly,
     * logs an error but doesn't throw,
     * since this might be caused by a client trying to mess with the server.
     */
    private _onMessage(type: unknown, contents: unknown) {
        if (typeof type !== 'string') {
            console.error(`Unexpected got message from server with type ${type}, which is not a string.`);
            return;
        }

        if (typeof contents !== 'string') {
            console.error(`Unexpected got message from client with contents ${contents}, which is not a string.`);
            return;
        }

        switch (type) {
            case 'message':
                this.onMessage && this.onMessage(contents);
                break;
            default:
                console.error(`Unexpected got message from client with type ${type}, which is not recognized.`);
                return;
        }
    }

    /**
     * Called when successfully connected to the server.
     *
     * Meant to be overridden.
     */
    public onConnect?(): void;

    /**
     * Called when successfully connected to the server.
     *
     * Meant to be overridden.
     */
    public onMessage?(message: string): void;

    /**
     * Called when disconnected from the server.
     * Passed the reason for disconnection.
     * See possible reasons at
     * https://socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
     *
     * Meant to be overridden.
     */
    public onDisconnect?(reason: string): void;

}

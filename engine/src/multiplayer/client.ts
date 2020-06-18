import * as SocketIOClient from 'socket.io-client';
import { beforeStepKey, GameObject } from '../game-object/game-object';
import { ClientEvent, ClientEventType, MessageType } from './event';
import { isServer } from './is-server';
import { Server } from './server';
import { User } from './user';

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
     * An array of events yet to be processed.
     */
    private _eventQueue: ClientEvent[] = [];

    /**
     * The user object this client controls.
     *
     * This is guaranteed to be available after onRegistered fires.
     */
    private _user: User | undefined;

    /**
     * Handles the events in the event queue.
     */
    private _handleEvents() {
        const eventsToHandle = this._eventQueue; // Moved in case ._eventQueue is modified during execution.
        this._eventQueue = [];

        eventsToHandle.forEach((event) => {
            switch (event.type) {
                case ClientEventType.Connect:
                    this.onConnected?.();
                    break;
                case ClientEventType.Disconnect:
                    this.onDisconnected?.(event.reason);
                    break;
                case ClientEventType.Message:
                    this._onMessage(event.message.type, event.message.contents);
                    break;
            }
        });
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
            case MessageType.User:
                this._user = new User(contents);
                this.onRegistered?.();
                break;
            case MessageType.String:
                this.onMessage?.(contents);
                break;
            default:
                console.error(`Unexpected got message from client with type ${type}, which is not recognized.`);
                return;
        }
    }

    /**
     * Connects this client to the server with the specified url.
     *
     * If no port is specified, defaults to `17771`.
     */
    public connect(url?: string) {
        if (isServer) { return; }

        if (!url) {
            url = `http://localhost:${Server.DEFAULT_PORT}`;
        }

        this._socketIOClient = SocketIOClient(url);

        this._socketIOClient.on('connect', () => {
            this._eventQueue.push({ type: ClientEventType.Connect });
        });

        this._socketIOClient.on('disconnect', (reason: string) => {
            this._eventQueue.push({ type: ClientEventType.Disconnect, reason });
        });

        this._socketIOClient.on('message', (type: unknown, contents: string) => {
            this._eventQueue.push({ type: ClientEventType.Message, message: { type, contents } });
        });
    }

    /**
     * Returns the user associated with this client.
     */
    public user(): User {
        if (!this._user) {
            throw new Error('User is only available after onRegistered fires');
        }
        return this._user;
    }

    /**
     * Sends the specified message to the server, with the specified type.
     */
    private _send(message: string, type: MessageType) {
        if (!this._socketIOClient) { return; }

        this._socketIOClient.send(type, message);
    }

    /**
     * Sends the specified message to the server.
     */
    public sendMessage(message: string) {
        this._send(message, MessageType.String);
    }

    /**
     * Before every step, handles all the events and calls the appropriate callbacks.
     */
    public [beforeStepKey]() {
        super[beforeStepKey] && super[beforeStepKey]!();

        this._handleEvents();
    }

    /**
     * Called when successfully connected to the server.
     *
     * Meant to be overridden.
     */
    public onConnected?(): void;

    /**
     * Called when the client is successfully registered on the server.
     */
    public onRegistered?(): void;

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
    public onDisconnected?(reason: string): void;

}

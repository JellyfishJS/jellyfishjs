import * as SocketIOForType from 'socket.io';
import { GameObject } from '../game-object/game-object';
import { MessageType } from './message';
import { SocketIO } from './socket';
import { User } from './user';

/**
 * A `Server` is a `GameObject` that,
 * when it exists in a server environment,
 * allows players to connect,
 * and share the state of any child `GameObject`s.
 */
export class Server extends GameObject {

    /**
     * The default port to use.
     */
    public static readonly DEFAULT_PORT = 17771;

    /**
     * The socket.io server this `Server` is using.
     */
    private _socketIOServer: SocketIOForType.Server | undefined;

    /**
     * A map from user ids to sockets.
     */
    private readonly _userToSocket: Map<string, SocketIOForType.Socket> = new Map();

    /**
     * A map from user ids to sockets.
     */
    private readonly _users: Set<User> = new Set();

    /**
     * Starts the server on the specified port.
     *
     * If no port is specified, uses port `17771`.
     *
     * Do not override.
     */
    public start(port: number = Server.DEFAULT_PORT) {
        if (!SocketIO || this._socketIOServer) { return; }

        this._socketIOServer = SocketIO(port);
        this._socketIOServer.on('connect', (socket) => {
            const user = new User();
            this._userToSocket.set(user.id(), socket);
            this._users.add(user);
            this.onUserJoined && this.onUserJoined(user);

            socket.on('message', (type: unknown, contents: unknown) => {
                this._onMessage(user, type, contents);
            });

            socket.on('disconnect', (reason: string) => {
                this._users.delete(user);
                this._userToSocket.delete(user.id());
                this.onUserLeft && this.onUserLeft(user, reason);
            });
        });
    }

    /**
     * Handles a message from the client.
     *
     * If it's not formatted properly,
     * logs an error but doesn't throw,
     * since this might be caused by a client trying to mess with the server.
     */
    private _onMessage(user: User, type: unknown, contents: unknown) {
        if (typeof type !== 'string') {
            console.error(`Unexpected got message from client with type ${type}, which is not a string.`);
            return;
        }

        if (typeof contents !== 'string') {
            console.error(`Unexpected got message from client with contents ${contents}, which is not a string.`);
            return;
        }

        switch (type) {
            case MessageType.String:
                this.onMessage && this.onMessage(user, contents);
                break;
            default:
                console.error(`Unexpected got message from client with type ${type}, which is not recognized.`);
                return;
        }
    }

    /**
     * Sends the specified string message to the specified user.
     */
    public sendMessage(user: User, message: string) {
        const socket = this._userToSocket.get(user.id());
        if (!socket) { return; }

        socket.send(MessageType.String, message);
    }

    /**
     * Sends the specified string message to all users.
     */
    public broadcast(message: string) {
        const { value: socket } = this._userToSocket.values().next() as { value: SocketIO.Socket | undefined };
        if (!socket) { return; }

        socket.broadcast.send(MessageType.String, message);
    }

    /**
     * Called when a user joins this server.
     *
     * Meant to be overridden.
     */
    public onUserJoined?(user: User): void;

    /**
     * Called when a user leaves this server.
     *
     * The reason is a text description of why they left.
     * See https://socket.io/docs/server-api/#Event-%E2%80%98disconnect%E2%80%99
     * for possible reasons.
     *
     * Meant to be overridden.
     */
    public onUserLeft?(user: User, reason: string): void;

    /**
     * Called when a user sends the server a message.
     *
     * Meant to be overridden.
     */
    public onMessage?(user: User, message: string): void;

}

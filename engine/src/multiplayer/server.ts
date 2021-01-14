import type * as SocketIOForType from 'socket.io';
import { gameObjectBodyKey } from '../body/body';
import {
    afterStepKey,
    beforeStepKey,
    bodyKey,
    childrenKey,
    gameKey,
    GameObject,
    parentKey,
} from '../game-object/game-object';
import { MessageType, ServerEvent, ServerEventType } from './event';
import { getSocketIO } from './socket';
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
     *
     * This updates as changes come in,
     * and does not respect the game loop.
     */
    private readonly _userToSocket = new Map<string, SocketIOForType.Socket>();

    /**
     * The set of the users currently on the server.
     *
     * This updates as events are sent to the hooks,
     * and isn't necessarily up-to-date.
     */
    private readonly _users: Set<User> = new Set();

    private readonly _shouldUpdateUser = new Map<string, boolean>();

    /**
     * An array of events yet to be processed.
     */
    private _eventQueue: ServerEvent[] = [];

    /**
     * Handles the events in the event queue.
     */
    private _handleEvents() {
        const eventsToHandle = this._eventQueue; // Moved in case ._eventQueue is modified during execution.
        this._eventQueue = [];

        eventsToHandle.forEach((event) => {
            switch (event.type) {
                case ServerEventType.Connect:
                    this._users.add(event.user);
                    this._shouldUpdateUser.set(event.user.id(), true);
                    this.onUserJoined?.(event.user);
                    break;
                case ServerEventType.Disconnect:
                    this._users.delete(event.user);
                    this._shouldUpdateUser.delete(event.user.id());
                    this.onUserLeft?.(event.user, event.reason);
                    break;
                case ServerEventType.Message:
                    this._onMessage(event.user, event.message.type, event.message.contents);
                    break;
            }
        });
    }

    /**
     * Sends a serialization of the children of the server.
     */
    private _sendUpdate() {
        const serialization = this.game().getSerializer().serialize(this[childrenKey]);

        for (const [user, shouldUpdate] of this._shouldUpdateUser.entries()) {
            if (!shouldUpdate) { continue; }
            const socket = this._userToSocket.get(user);
            if (!socket) { continue; }
            this._send(new User(user), serialization, MessageType.Update);
        }
    }

    /**
     * Handles an update with the specified JSON string.
     */
    private _handleUpdate(updateObject: {}, user: User) {
        try {
            this.game().getSerializer().deserialize(updateObject, this[childrenKey]);
        } catch (error) {
            console.error(`Serialization failed with error: ${error}`);
        }

        const updateGameObject = (gameObject: GameObject) => {
            for (const body of gameObject[bodyKey]) {
                body[gameObjectBodyKey] = gameObject;
            }

            for (const child of gameObject.children()) {
                child[parentKey] = gameObject;
                child[gameKey] = this[gameKey];
                updateGameObject(child);
            }
        };

        updateGameObject(this);

        this._shouldUpdateUser.set(user.id(), true);
    }

    /**
     * Handles a message from the client.
     *
     * If it's not formatted properly,
     * logs an error but doesn't throw,
     * since this might be caused by a client trying to mess with the server.
     */
    private _onMessage(user: User, type: unknown, contents: unknown) {
        if (type === MessageType.Update) {
            if (typeof contents !== 'object' || !contents) {
                console.log(`Invalid update ${contents}`);
                return;
            }

            this._handleUpdate(contents, user);
            return;
        }

        if (typeof contents !== 'string') {
            console.error(`Unexpectedly got message from client with type ${type} and contents ${contents}, which is not a string.`);
            return;
        }

        switch (type) {
            case MessageType.String:
                this.onMessage?.(user, contents);
                return;
            default:
                console.error(`Unexpectedly got message from client with type ${type}, which is not recognized.`);
                return;
        }
    }

    /**
     * Returns the set of users
     * currently connected to this server.
     *
     * Is not necessarily up to date,
     * but doesn't update until just before updates
     * are sent to the hooks.
     */
    public users(): Set<User> {
        // Defensive copy
        return new Set(this._users);
    }

    /**
     * Starts the server on the specified port.
     *
     * If no port is specified, uses port `17771`.
     *
     * Do not override.
     */
    public start(port: number = Server.DEFAULT_PORT) {
        const SocketIO = getSocketIO();
        if (!SocketIO || this._socketIOServer) { return; }

        this._socketIOServer = SocketIO(port);
        this._socketIOServer.on('connect', (socket) => {
            // this._userToSocket changes aren't queued,
            // to avoid using sockets that are dead.
            const user = new User();
            this._userToSocket.set(user.id(), socket);
            this._eventQueue.push({ type: ServerEventType.Connect, user });

            this._send(user, user.id(), MessageType.User);

            socket.on('message', (type: unknown, contents: unknown) => {
                this._eventQueue.push({ type: ServerEventType.Message, user, message: { type, contents } });
            });

            socket.on('disconnect', (reason: string) => {
                this._userToSocket.delete(user.id());
                this._eventQueue.push({ type: ServerEventType.Disconnect, user, reason });
            });
        });
    }

    /**
     * Sends the specified message to the specified user,
     * with the specified type.
     */
    private _send(user: User, message: unknown, type: MessageType) {
        const socket = this._userToSocket.get(user.id());
        if (!socket) { return; }

        socket.send(type, message);
    }

    /**
     * Sends the specified string message to the specified user.
     */
    public sendMessage(user: User, message: string) {
        this._send(user, message, MessageType.String);
    }

    /**
     * Sends the specified message to every Client.
     */
    private _broadcast(message: string, type: MessageType) {
        for (const socket of this._userToSocket.values()) {
            socket.send(type, message);
        }
    }

    /**
     * Sends the specified string message to all users.
     */
    public broadcastMessage(message: string) {
        this._broadcast(message, MessageType.String);
    }

    /**
     * Before every step, handles all the events and calls the appropriate callbacks.
     */
    public [beforeStepKey]() {
        super[beforeStepKey] && super[beforeStepKey]!();

        this._handleEvents();
    }

    /**
     * After every step, send the state of the server to each client.
     */
    public [afterStepKey]() {
        super[afterStepKey] && super[afterStepKey]!();

        this._sendUpdate();
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

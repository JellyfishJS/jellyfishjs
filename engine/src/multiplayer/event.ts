import type { User } from './user';

/**
 * Represents the various kinds of events that can happen to a client.
 */
export type ClientEvent =
    | ClientConnectEvent
    | ClientDisconnectEvent
    | ClientMessageEvent;

/**
 * Represents a client connecting to the server.
 */
export interface ClientConnectEvent {
    type: ClientEventType.Connect;
}

/**
 * Represents a client disconnecting from the server.
 */
export interface ClientDisconnectEvent {
    type: ClientEventType.Disconnect;
    reason: string;
}

/**
 * Represents a client disconnecting from the server.
 */
export interface ClientMessageEvent {
    type: ClientEventType.Message;
    message: Message;
}

/**
 * Represents a type of event that can happen on the client.
 */
export enum ClientEventType {
    Connect = 'connect',
    Disconnect = 'disconnect',
    Message = 'message',
}

/**
 * Represents the various kinds of events that can happen to a server.
 */
export type ServerEvent =
    | ServerConnectEvent
    | ServerDisconnectEvent
    | ServerMessageEvent;

/**
 * Represents a client connecting to the server.
 */
export interface ServerConnectEvent {
    type: ServerEventType.Connect;
    user: User;
}

/**
 * Represents a client disconnecting from the server.
 */
export interface ServerDisconnectEvent {
    type: ServerEventType.Disconnect;
    user: User;
    reason: string;
}

/**
 * Represents a client disconnecting from the server.
 */
export interface ServerMessageEvent {
    type: ServerEventType.Message;
    user: User;
    message: Message;
}

/**
 * Represents a type of event that can happen on a server.
 */
export enum ServerEventType {
    Connect = 'connect',
    Disconnect = 'disconnect',
    Message = 'message',
}

/**
 * Represents a message sent by the server or client.
 * Fields are unknown,
 * since this is used before the message is validated.
 */
interface Message {
    type: unknown;
    contents: unknown;
}

/**
 * Represents a type of message sent between the client and server.
 */
export enum MessageType {
    /**
     * Messages sent to the user to inform them of their ID.
     */
    User = 'user',
    /**
     * Sent by the server or client containing information
     * about how to update the server state.
     */
    Update = 'update',
    /**
     * Custom messages sent by the developer.
     */
    String = 'string',
}

import type * as Matter from 'matter-js';
import type * as PIXI from 'pixi.js';
import { Body, gameObjectBodyKey, updateBodyFromSelfBodyKey, updateSelfFromBodyBodyKey } from '../body/body';
import type { Game } from '../game/game';
import type { Client } from '../multiplayer/client';
import type { Server } from '../multiplayer/server';
import type { User } from '../multiplayer/user';
import { Sprite, spriteDrawKey } from '../sprite/sprite';
import type { AnyAmountOf } from '../util/as-array';

/**
 * Allowable types for GameObject bodies.
 */
export type GameObjectBody = AnyAmountOf<Matter.Body>;

/**
 * Allowable types for GameObject sprites.
 */
export type GameObjectSprite = AnyAmountOf<PIXI.DisplayObject>;

/**
 * The symbol used to store the GameObject ID.
 *
 * A symbol is used instead of a private variable,
 * since user code will subclass this class,
 * so private variables can collide.
 */
export const idKey = Symbol('id');

/**
 * The symbol used to access sprites.
 */
export const spriteKey = Symbol('sprite');

/**
 * The symbol used to access bodies.
 */
export const bodyKey = Symbol('body');

/**
 * The symbol used to access the GameObject's to-be-destroyed status.
 */
export const toBeDestroyedKey = Symbol('to-be-destroyed');

/**
 * The symbol used to access the GameObject's destroyed status.
 */
export const wasDestroyedKey = Symbol('was-destroyed');

/**
 * The symbol used to access the GameObject's parent.
 */
export const parentKey = Symbol('parent');

/**
 * The symbol used to access the GameObject's children.
 */
export const childrenKey = Symbol('children');

/**
 * The symbol used to access the game.
 */
export const gameKey = Symbol('game');

/**
 * The symbol used to access the owning User.
 */
export const ownerKey = Symbol('owner');

/**
 * The symbol used to add an unoverridable `beforeStep` hook.
 */
export const beforeStepKey = Symbol('before-step');

/**
 * The symbol used to add an unoverridable `onCreate` hook.
 */
export const onCreateKey = Symbol('on-create');

/**
 * The symbol used to add an unoverridable `keyPressed` hook.
 */
export const keyPressedKey = Symbol('key-pressed');

/**
 * The symbol used to add an unoverridable `keyReleased` hook.
 */
export const keyReleasedKey = Symbol('key-released');

/**
 * The symbol used to add an unoverridable `keyHeld` hook.
 */
export const keyHeldKey = Symbol('key-held');

/**
 * The symbol used to add an unoverridable `beforePhysics` hook.
 */
export const beforePhysicsKey = Symbol('before-physics');

/**
 * The symbol used to add an unoverridable `afterPhysics` hook.
 */
export const afterPhysicsKey = Symbol('after-physics');

/**
 * The symbol used to add an unoverridable `step` hook.
 */
export const stepKey = Symbol('step');

/**
 * The symbol used to add an unoverridable `draw` hook.
 */
export const drawKey = Symbol('draw');

/**
 * The symbol used to add an unoverridable `onDestroy` hook.
 */
export const onDestroyKey = Symbol('on-destroy');

/**
 * The symbol used to add an unoverridable `afterStep` hook.
 */
export const afterStepKey = Symbol('after-step');

/**
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject {
    /**
     * The ID for this GameObject.
     */
    public [idKey]: string;

    /**
     * The Sprites for this GameObject.
     */
    public [spriteKey]: Sprite[] = [];

    /**
     * The Bodies for this GameObject.
     */
    public [bodyKey]: Body[] = [];

    /**
     * Whether this GameObject should be destroyed by the end of the current step.
     */
    public [toBeDestroyedKey] = false;

    /**
     * Whether this GameObject was destroyed.
     */
    public [wasDestroyedKey] = false;

    /**
     * The parent of this GameObject.
     */
    private [parentKey]: GameObject;

    /**
     * List of children GameObjects of this GameObject.
     */
    private [childrenKey]: Map<string, GameObject> = new Map<string, GameObject>();

    /**
     * The game this GameObject belongs to.
     */
    public [gameKey]: Game = undefined as any;

    /**
     * The user this GameObject belongs to, or undefined if it's the server.
     */
    private [ownerKey]: User | undefined;

    /**
     * Creates a GameObject with parameters specified as the child of this GameObject.
     */
    public createObject<
        Subclass extends new (...args: any[]) => GameObject,
    >(
        Class: Subclass,
        ...args: ConstructorParameters<Subclass>
    ): InstanceType<Subclass> {
        const newObject = this.game().createObject(Class, ...args);
        newObject[parentKey] = this;

        return newObject;
    }

    /**
     * Creates a Sprite with the parameters specified
     * as a sprite of this GameObject.
     */
    public createSprite<
        Subclass extends new (...args: any[]) => Sprite<any>,
    >(
        Class: Subclass,
        ...args: ConstructorParameters<Subclass>
    ): InstanceType<Subclass> {
        const newSprite = new Class(...args) as InstanceType<Subclass>;
        this[spriteKey].push(newSprite);
        return newSprite;
    }

    /**
     * Creates a Body with the parameters specified
     * as a Body of this GameObject.
     */
    public createBody<
        Subclass extends new (...args: any[]) => Body,
    >(
        Class: Subclass,
        ...args: ConstructorParameters<Subclass>
    ): InstanceType<Subclass> {
        const newBody = new Class(...args) as InstanceType<Subclass>;
        this[bodyKey].push(newBody);
        newBody[gameObjectBodyKey] = this;
        newBody[updateSelfFromBodyBodyKey]();
        return newBody;
    }

    /**
     * Returns the ID of this GameObject.
     */
    public id() {
        return this[idKey];
    }

    /**
     * Returns the Game containing this GameObject.
     * If the constructor for this GameObject was called directly, returns undefined.
     */
    public game() {
        return this[gameKey];
    }

    /**
     * Returns the parent GameObject, or undefined if it is a top-level GameObject.
     */
    public parent() {
        return this[parentKey];
    }

    /**
     * Returns the children GameObjects, or an empty array if there are none.
     */
    public children() {
        return this[childrenKey].values();
    }

    /**
     * Schedule the GameObject for destruction at the end of the current step.
     * This done recursively for all children as well.
     *
     * Do not override.
     */
    public destroy(): void {
        this[toBeDestroyedKey] = true;
        this[childrenKey].forEach((child) => child.destroy());
    }

    /**
     * Returns whether this GameObject has been destroyed.
     *
     * Do not override.
     */
    public wasDestroyed(): boolean {
        return this[wasDestroyedKey];
    }

    /**
     * Returns the User that owns this GameObject,
     * or undefined if owned by the server.
     */
    public getOwner(): User | undefined {
        return this[ownerKey];
    }

    /**
     * Sets the User that owns this GameObject.
     * Use undefined to give ownership to the server.
     */
    public setOwner(owner: User | undefined): void {
        this[ownerKey] = owner;
    }

    /**
     * Checks if this GameObject is owned by the current user.
     *
     * We do this by traversing up the object tree:
     *   - If we find a Server, we return true when the owner is the server (undefined).
     *   - If we find a Client, we return true when the owner is the client's User object.
     *   - If we reach the root without finding either a Client or Server,
     *     then the GameObject is local and not part of multiplayer, so we always return true.
     */
    public isOwnedByCurrentUser(): boolean {
        let current: GameObject | undefined = this;

        // This avoids circular dependencies.
        const ClientClass: typeof Client = require('../multiplayer/client').Client;
        const ServerClass: typeof Server = require('../multiplayer/server').Server;

        while (current !== undefined) {
            if (current instanceof ServerClass) {
                return this[ownerKey] === undefined;
            } else if (current instanceof ClientClass) {
                return this[ownerKey] === current.user();
            }
            current = current.parent();
        }

        return true;
    }

    /**
     * A private `beforeStep` hook for the system.
     */
    public [beforeStepKey]?(): void;

    /**
     * Called before every step.
     *
     * Meant to be overridden.
     */
    public beforeStep?(): void;

    /**
     * A private `onCreate` hook for the system.
     */
    public [onCreateKey]?(): void;

    /**
     * Called when the GameObject is created.
     *
     * Meant to be overridden.
     */
    public onCreate?(): void;

    /**
     * If this GameObject needs any physics bodies,
     * override this and return them.
     *
     * A single `Matter.Body`, an array of `Matter.Body`s,
     * or `undefined` can be returned.
     *
     * Only called if the optional dependency "matter-js" is installed.
     * Run `npm i matter-js` to install this dependency.
     */
    public setUpPhysicsBody?(): Body;

    /**
     * A private `keyPressed` hook for the system.
     */
    public [keyPressedKey]?(keyCode: number): void;

    /**
     * Called once for each time a key is pressed during the processEvents portion of the game loop
     *
     * Meant to be overridden.
     */
    public keyPressed?(keyCode: number): void;

    /**
     * A private `keyReleased` hook for the system.
     */
    public [keyReleasedKey]?(keyCode: number): void;

    /**
     * Called once for each time a key is released during the processEvents portion of the game loop
     *
     * Meant to be overridden.
     */
    public keyReleased?(keyCode: number): void;

    /**
     * A private `keyHeld` hook for the system.
     */
    public [keyHeldKey]?(keyCode: number): void;

    /**
     * Called once for each time held down on each step of the gameLoop
     *
     * Meant to be overridden.
     */
    public keyHeld?(keyCode: number): void;

    /**
     * Called before performing physics calculations.
     *
     * Meant to be overridden.
     */
    public beforePhysics?(): void;

    /**
     * A private `beforePhysics` hook for the system.
     */
    public [beforePhysicsKey]?(): void {
        this[bodyKey].forEach((body) => {
            body[updateBodyFromSelfBodyKey]();
        });
    }

    /**
     * Called when this GameObject collides with another GameObject.
     *
     * Will be called after the beforePhysics hook and prior to the afterPhysics hook.
     */
    public onCollision?(otherGameObject: GameObject): void;

    /**
     * A private `afterPhysics` hook for the system.
     */
    public [afterPhysicsKey]?(): void {
        this[bodyKey].forEach((body) => {
            body[updateSelfFromBodyBodyKey]();
        });
    }

    /**
     * Called after performing physics calculations.
     *
     * Meant to be overridden.
     */
    public afterPhysics?(): void;

    /**
     * A private `step` hook for the system.
     */
    public [stepKey]?(): void;

    /**
     * Called every step.
     *
     * Meant to be overridden.
     */
    public step?(): void;

    /**
     * Sends the draw event to each of the sprites.
     */
    public [drawKey]?(pixi: typeof PIXI, container: PIXI.Container): void {
        this[spriteKey].forEach((sprite) => { sprite[spriteDrawKey](pixi, container); });
    }

    /**
     * A private `onDestroy` hook for the system.
     */
    public [onDestroyKey]?(): void;

    /**
     * Called when the GameObject is destroyed.
     *
     * Meant to be overridden.
     */
    public onDestroy?(): void;

    /**
     * A private `afterStep` hook for the system.
     */
    public [afterStepKey]?(): void;

    /**
     * Called at the end of every step.
     *
     * Meant to be overridden.
     */
    public afterStep?(): void;

}

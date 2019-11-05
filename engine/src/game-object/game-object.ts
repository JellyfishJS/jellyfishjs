import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { Game } from '../game/game';
import { AnyAmountOf } from '../util/as-array';

/**
 * Allowable types for GameObject bodies.
 */
export type GameObjectBody = AnyAmountOf<Matter.Body>;

/**
 * Allowable types for GameObject sprites.
 */
export type GameObjectSprite = AnyAmountOf<PIXI.DisplayObject>;

/**
 * The symbol used to access containers.
 *
 * A symbol is used instead of a private variable,
 * since user code will subclass this class,
 * so private variables can collide.
 */
export const containerKey = Symbol('container');

/**
 * The symbol used to access sprites.
 *
 * A symbol is used instead of a private variable,
 * since user code will subclass this class,
 * so private variables can collide.
 */
export const spriteKey = Symbol('sprite');

/**
 * The symbol used to access the object's to-be-destroyed status.
 */
export const toBeDestroyedKey = Symbol('to-be-destroyed');

/**
 * The symbol used to access the object's destroyed status.
 */
export const wasDestroyedKey = Symbol('was-destroyed');

/**
 * The symbol used to access the object's parent
 */
export const parent = Symbol('parent');

/**
 * The symbol used to access the object's children
 */
export const children = Symbol('children');

/**
 * The symbol used to access the game
 */
export const game = Symbol('game');

/**
 * Allowable types for GameObject bodies.
 */
export type GameObjectBody = AnyAmountOf<Matter.Body>;

/**
 * Allowable types for GameObject sprites.
 */
export type GameObjectSprite = AnyAmountOf<PIXI.DisplayObject>;

/**
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject<
    Sprite extends GameObjectSprite = GameObjectSprite,
    Body extends GameObjectBody = GameObjectBody
> {

    /**
     * The container for this GameObject.
     */
    public [containerKey]: PIXI.Container | undefined;

    /**
     * The sprites for this GameObject.
     */
    public [spriteKey]: Sprite | undefined;

    /**
     * The world in which any physics objects exist.
     *
     * Can be `undefined` if the "matter-js" optional dependency isn't installed.
     * If it were optional, it would be very inconvenient in projects with physics,
     * since for them it will never be `undefined`.
     */
    public physicsWorld: Matter.World = undefined as any;

    /**
     * The physics body this GameObject uses.
     */
    public physicsBody: Body | undefined;

    /**
     * Whether this object should be destroyed by the end of the current step.
     */
    public [toBeDestroyedKey] = false;

    /**
     * Whether this object was destroyed.
     */
    public [wasDestroyedKey] = false;

    /**
     * The parent of this game object
     */
    private [parent]: GameObject;

    /**
     * List of children objects of this game object
     */
    private [children]: GameObject[] = [];

    /**
     * The game this gameObject belongs to
     */
    private [game]: Game = undefined as any;

    /**
     * Creates an object with parameters specified as the child of this game object
     */
    public createObject<
        Subclass extends new (...args: any[]) => GameObject,
        >(
        Class: Subclass,
        ...args: ConstructorParameters<Subclass>
    ): InstanceType<Subclass> {
        const newObject = this[game].createObject(Class, ...args);
        newObject[parent] = this;
        this[children].push(newObject);
        return newObject;
    }

    /**
     * Returns the parent GameObject, or undefined if it is a top-level GameObject
     */
    public parent() {
        return this[parent];
    }

    /**
     * Returns the children GameObjects, or an empty array if there are none
     */
    public children() {
        return this[children];
    }

    /**
     * Sets the container in which to draw sprites
     * of this GameObject.
     *
     * Do not override.
     */
    public setContainer(container: PIXI.Container) {
        this[containerKey] = container;
    }

    /**
     * Schedule the game object for destruction at the end of the current step.
     *
     * Do not override.
     */
    public destroy(): void {
        this[toBeDestroyedKey] = true;
    }

    /**
     * Returns whether this object has been destroyed.
     *
     * Do not override.
     */
    public wasDestroyed(): boolean {
        return this[wasDestroyedKey];
    }

    /**
     * Called before every step.
     *
     * Meant to be overridden.
     */
    public beforeStep?(): void;

    /**
     * Called when the object is created.
     *
     * Meant to be overridden.
     */
    public onCreate?(): void;

    /**
     * If this GameObject needs any physics bodies,
     * override this and return them.
     *
     * A single `Matter.Body`, and array of `Matter.Body`s,
     * or `undefined` can be returned.
     *
     * Only called if the optional dependency "matter-js" is installed.
     * Run `npm i matter-js` to install this dependency.
     */
    public setUpPhysicsBody?(): Body;

    /**
     * Sets up and returns the sprite for this GameObject.
     *
     * Meant to be overridden.
     */
    public setUpSprite?(pixi: typeof PIXI, container: PIXI.Container): Sprite;

    /**
     * Called once for each time a key is pressed during the processEvents portion of the game loop
     *
     * Meant to be overridden.
     */
    public keyPressed?(keyCode: number): void;

    /**
     * Called once for each time a key is released during the processEvents portion of the game loop
     *
     * Meant to be overridden.
     */
    public keyReleased?(keyCode: number): void;

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
     * Called after performing physics calculations.
     *
     * Meant to be overridden.
     */
    public afterPhysics?(): void;

    /**
     * Called every step.
     *
     * Meant to be overridden.
     */
    public step?(): void;

    /**
     * Called every step, to do drawing actions.
     *
     * Put any code that manipulates sprites here.
     *
     * Meant to be overridden.
     */
    public draw?(pixi: typeof PIXI, sprite: Sprite, container: PIXI.Container): void;

    /**
     * Called when the object is destroyed.
     *
     * Meant to be overridden.
     */
    public onDestroy?(): void;

    /**
     * Called at the end of every step.
     *
     * Meant to be overridden.
     */
    public afterStep?(): void;

}

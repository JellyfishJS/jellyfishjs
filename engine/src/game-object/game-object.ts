import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { AnyAmountOf } from '../util/as-array';

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
    Sprite extends GameObjectSprite = undefined,
    Body extends GameObjectBody = undefined
> {

    /**
     * The container for this GameObject.
     */
    public [containerKey]: PIXI.Container | undefined;

    /**
     * Whether this object should be destroyed by the end of the current step.
     */
    public [toBeDestroyedKey] = false;

    /**
     * Whether this object was destroyed.
     */
    public [wasDestroyedKey] = false;

    /**
     * Sets the container in which to draw sprites
     * of this GameObject.
     */
    public setContainer(container: PIXI.Container) {
        this[containerKey] = container;
    }

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
     * Called when the object is created.
     *
     * Meant to be overridden.
     */
    public onCreate?(): void;

    /**
     * Called when the object is destroyed.
     *
     * Meant to be overridden.
     */
    public onDestroy?(): void;

    /**
     * Sets up and returns the sprite for this GameObject.
     *
     * Meant to be overridden.
     */
    public setUpSprite?(pixi: typeof PIXI, container: PIXI.Container): Sprite;

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
     * Called before every step.
     *
     * Meant to be overridden.
     */
    public beforeStep?(): void;

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
     * Called at the end of every step.
     *
     * Meant to be overridden.
     */
    public endStep?(): void;

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
     * Called every step, to do drawing actions.
     *
     * Put any code that manipulates sprites here.
     *
     * Meant to be overridden.
     */
    public draw?(pixi: typeof PIXI, sprite: Sprite, container: PIXI.Container): void;

    /**
     * Schedule the game object for destruction at the end of the current step.
     */
    public destroy(): void {
        this[toBeDestroyedKey] = true;
    }

    /**
     * Returns whether this object has been destroyed.
     */
    public wasDestroyed(): boolean {
        return this[wasDestroyedKey];
    }
}

import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';

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
 * Allowable types for GameObject bodies.
 */
export type GameObjectBody = undefined | Matter.Body | Matter.Body[];

/**
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject<Sprite = unknown, Body extends GameObjectBody = undefined> {

    /**
     * The container for this GameObject.
     */
    public [containerKey]: PIXI.Container | undefined;

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
     * Sets up and returns the sprite for this GameObject.
     *
     * Meant to be overridden.
     */
    public abstract getSprite(pixi: typeof PIXI, container: PIXI.Container): Sprite;

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
     * Called every step, to do drawing actions.
     *
     * Put any code that manipulates sprites here.
     *
     * Meant to be overridden.
     */
    public draw?(pixi: typeof PIXI, sprite: Sprite, container: PIXI.Container): void;

}

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
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject<Sprite = unknown> {

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

}

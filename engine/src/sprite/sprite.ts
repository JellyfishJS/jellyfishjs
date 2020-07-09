import type * as PIXI from 'pixi.js';

/**
 * The key used internally
 * to trigger the draw hook.
 */
export const spriteDrawKey = Symbol('spriteDrawKey');

/**
 * The key used internally
 * to access the initialized sprite.
 */
export const pixiSpriteKey = Symbol('pixiSpriteKey');

/**
 * Used to draw something on screen.
 *
 * Subclass this, or use another existing subclass,
 * to add graphics to your game.
 *
 * Methods `initializeSprite` and `draw` can be overridden
 * — see their documentation for details.
 */
export abstract class Sprite<PIXISprite = PIXI.Sprite> {

    /**
     * Stores the sprite-related object used by this sprite.
     *
     * This is always left as undefined on the server,
     * since PIXI does not work there.
     */
    private [pixiSpriteKey]: PIXISprite | undefined;

    /**
     * The hook called by the system to trigger draws.
     *
     * Calls the relevant public hooks.
     *
     * This is not called on the server.
     */
    public [spriteDrawKey](pixi: typeof PIXI, container: PIXI.Container) {
        if (!this[pixiSpriteKey]) {
            this[pixiSpriteKey] = this.initializeSprite(pixi, container);
        }

        this.draw(pixi, this[pixiSpriteKey]!, container);
    }

    /**
     * Returns the sprite-related object this Sprite displays.
     *
     * This is called on the creation of this Sprite,
     * and when it is deserialized for the first time.
     * It should work regardless of the state of this Sprite.
     *
     * This can return any type,
     * as specified by the generic type parameter `PIXISprite`
     * but is typically a `PIXI.Sprite`.
     * If multiple sprites are needed,
     * it can be an array or map of sprites.
     *
     * This is not called on the server.
     */
    public abstract initializeSprite(pixi: typeof PIXI, container: PIXI.Container): PIXISprite;

    /**
     * Draws this Sprite in the specified container.
     *
     * Override to specify how this Sprite should be drawn.
     *
     * The passed `pixiSprite` is the value returned by `initializeSprite`.
     *
     * This is not called on the server.
     */
    public abstract draw(pixi: typeof PIXI, pixiSprite: PIXISprite, container: PIXI.Container): void;

}

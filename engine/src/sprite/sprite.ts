import type * as PIXI from 'pixi.js';

export const spriteDrawKey = Symbol('spriteDrawKey');
export const pixiSpriteKey = Symbol('pixiSpriteKey');

export abstract class Sprite<PIXISprite = PIXI.Sprite> {
    private [pixiSpriteKey]: PIXISprite | undefined;

    public [spriteDrawKey](pixi: typeof PIXI, container: PIXI.Container) {
        if (!this[pixiSpriteKey]) {
            this[pixiSpriteKey] = this.initializeSprite(pixi, container);
        }

        this.draw(pixi, this[pixiSpriteKey]!, container);
    }

    public abstract initializeSprite(pixi: typeof PIXI, container: PIXI.Container): PIXISprite;

    public abstract draw(pixi: typeof PIXI, pixiSprite: PIXISprite, container: PIXI.Container): void;
}

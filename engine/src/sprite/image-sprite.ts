import type { Body } from 'matter-js';
import { Angle, Vector } from '../util/geometry';
import { Sprite } from './sprite';

/**
 * The key used to access the private image name.
 */
export const imageNameKey = Symbol('imageNameKey');

/**
 * A sprite used to draw a single image on the screen.
 *
 * Follows the position and angle,
 * or else follows the specified body.
 */
export class ImageSprite extends Sprite {

    /**
     * The name of the image to load.
     * Should be formatted like a url
     * (e.g. /assets/image.png if it is at https://example.com/assets/image.png).
     */
    private [imageNameKey]: string;

    /**
     * The position at which this sprite is drawn.
     *
     * Can be modified in any way
     * — this is checked every tick.
     *
     * Defaults to `Vector.zero`.
     *
     * Automatically updates if `following` is set.
     */
    public position: Vector = Vector.zero;

    /**
     * The angle which the sprite is facing.
     *
     * `Angle.right` represents the original orientation of the image.
     *
     * Defaults to `Angle.right`.
     *
     * Automatically updates if `following` is set.
     */
    public angle: Angle = Angle.right;

    /**
     * If set, this sprite follows the specified body.
     */
    public following: Body | undefined;

    public constructor(imageName: string) {
        super();
        this[imageNameKey] = imageName;
    }

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = pixi.Sprite.from(this[imageNameKey]);
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Sprite) {
        if (this.following) {
            this.position = Vector.object(this.following.position);
            this.angle = Angle.radians(this.following.angle);
        }

        [sprite.x, sprite.y] = [this.position.x(), this.position.y()];
        sprite.angle = this.angle.degrees();
    }

}

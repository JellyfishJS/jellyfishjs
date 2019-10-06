import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class Decoration extends GameObject<PIXI.Graphics, Body> {

    private readonly position: Vector;
    private readonly size: number;
    private readonly color: number;

    public constructor(position: Vector, size: number, color: number) {
        super();
        this.position = position;
        this.size = size;
        this.color = color;
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Graphics) {
        sprite.clear();
        sprite.beginFill(this.color);
        sprite.drawCircle(this.position.x(), this.position.y(), this.size);
    }

}

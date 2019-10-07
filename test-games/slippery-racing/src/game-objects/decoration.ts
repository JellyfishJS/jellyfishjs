import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class Decoration extends GameObject<PIXI.Graphics, Body | undefined> {

    private readonly position: Vector;
    private readonly size: number;
    private readonly color: number;
    private readonly solid: boolean;

    public constructor(position: Vector, size: number, color: number, solid: boolean = false) {
        super();
        this.position = position;
        this.size = size;
        this.color = color;
        this.solid = solid;
    }

    public setUpPhysicsBody() {
        if (!this.solid) { return; }

        const body = Bodies.circle(
            this.position.x(),
            this.position.y(),
            this.size,
            {
                isStatic: true,
            },
        );
        return body;
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

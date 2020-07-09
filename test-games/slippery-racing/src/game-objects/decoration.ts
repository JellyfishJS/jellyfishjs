import { GameObject, Sprite, Vector } from 'engine';
import { Bodies, Body } from 'matter-js';

export class Decoration extends GameObject<Body | undefined> {

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
        this.createSprite(DecorationSprite, position, color, size);
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

}

class DecorationSprite extends Sprite<PIXI.Graphics> {
    public position: Vector;
    public color: number;
    public size: number;

    public constructor(position: Vector, color: number, size: number) {
        super();
        this.position = position;
        this.color = color;
        this.size = size;
    }

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
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

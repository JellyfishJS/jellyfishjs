import { Body, GameObject, Sprite, Vector } from 'engine';
import { Bodies } from 'matter-js';

export class Decoration extends GameObject {

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

    public onCreate() {
        this.createSprite(DecorationSprite, this.position, this.color, this.size);
        if (this.solid) {
            this.createBody(DecorationBody, this.size, this.position);
        }
    }

}

class DecorationBody extends Body {

    private size: number;

    public constructor(size: number, position: Vector) {
        super();
        this.size = size;
        this.position = position;
    }

    public initializeBody() {
        return Bodies.circle(
            this.position.x(),
            this.position.y(),
            this.size,
            {
                isStatic: true,
            },
        );
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

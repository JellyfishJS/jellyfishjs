import * as Jellyfish from 'engine';

export class Circle extends Jellyfish.GameObject {
    private position = Jellyfish.Vector.xy(20, 20);

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    public step() {
        this.position = this.position.plus(Jellyfish.Vector.xy(0.15, 0.1));
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Graphics) {
        sprite.clear();
        sprite.beginFill(0xFF00);
        sprite.drawCircle(this.position.x(), this.position.y(), 5);
    }
}
Jellyfish.game.registerClass(Circle);

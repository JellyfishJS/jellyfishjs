import * as Jellyfish from 'engine';

export class Circle extends Jellyfish.GameObject {
    private position = Jellyfish.Vector.xy(20, 20);

    public step() {
        this.position = this.position.plus(Jellyfish.Vector.xy(0.15, 0.1));
        console.log(this.position);
    }
}
Jellyfish.game.registerClass(Circle);

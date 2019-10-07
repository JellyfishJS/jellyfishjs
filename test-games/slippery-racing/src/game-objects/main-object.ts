import { Angle, game, GameObject, Vector } from 'engine';
import { Camera } from './camera';
import { Car } from './car';
import { Decoration } from './decoration';
import { LooseTire } from './loose-tire';
import { SoccerBall } from './soccer-ball';

export class MainObject extends GameObject {

    private generateCircle(center: Vector, size: number) {
        (game.createObject as any)(Decoration, center, size + 460, 0x888888);
        (game.createObject as any)(Decoration, center, size + 450, 0xd7d7d7);
        (game.createObject as any)(Decoration, center, size + 300, 0x44bf4d);
        (game.createObject as any)(Decoration, center, size + 10, 0x3e7242, true);
        (game.createObject as any)(Decoration, center, size, 0x45824a);
    }

    private generateTireCircle(center: Vector, size: number, amount: number) {
        for (let i = 0; i < 360; i += 360 / amount) {
            (game.createObject as any)(
                LooseTire,
                center.plus(Vector.lengthAndDirection(size, Angle.degrees(i))),
            );
        }

        for (let i = 180 / amount; i < 360; i += 360 / amount) {
            (game.createObject as any)(
                LooseTire,
                center.plus(Vector.lengthAndDirection(size + 100, Angle.degrees(i))),
            );
        }
    }

    public onCreate() {

        this.generateCircle(Vector.zero, 200);
        this.generateCircle(Vector.xy(1200, 1500), 400);
        this.generateCircle(Vector.xy(-1900, 1500), 800);
        this.generateCircle(Vector.xy(-1900, -2200), 150);
        this.generateCircle(Vector.xy(1900, -2700), 150);
        this.generateCircle(Vector.xy(2900, -2400), 250);

        const camera = (game.createObject as any)(Camera) as Camera;
        (game.createObject as any)(
            Car,
            Vector.xy(-300, 0),
            {
                topSpeed: 0.02,
                acceleration: 0.001,
                spinning: 0.0006,
                cornering: 0.000015,
                handling: 0.3,
            },
            camera,
        );

        this.generateTireCircle(Vector.zero, 800, 24);
        this.generateTireCircle(Vector.xy(-2900, -2700), 300, 48);

        (game.createObject as any)(
            SoccerBall,
            Vector.xy(0, -1400),
        );

        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}

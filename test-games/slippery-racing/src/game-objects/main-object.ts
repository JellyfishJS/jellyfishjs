import { Angle, game, GameObject, Vector } from 'engine';
import { Camera } from './camera';
import { Car } from './car';
import { Decoration } from './decoration';
import { LooseTire } from './loose-tire';

export class MainObject extends GameObject {

    public onCreate() {

        const center = Vector.xy(400, 1000);

        (game.createObject as any)(Decoration, center, 660, 0x888888);
        (game.createObject as any)(Decoration, center, 650, 0xd7d7d7);
        (game.createObject as any)(Decoration, center, 500, 0x44bf4d);
        (game.createObject as any)(Decoration, center, 210, 0x3e7242, true);
        (game.createObject as any)(Decoration, center, 200, 0x45824a);

        const camera = (game.createObject as any)(Camera) as Camera;
        (game.createObject as any)(
            Car,
            Vector.xy(60, 1000),
            {
                topSpeed: 0.02,
                acceleration: 0.001,
                spinning: 0.00003,
                cornering: 0.000015,
                handling: 0.3,
            },
            camera,
        );

        for (let i = 0; i < 360; i += 15) {
            (game.createObject as any)(
                LooseTire,
                center.plus(Vector.lengthAndDirection(800, Angle.degrees(i))),
            );
        }

        for (let i = 7.5; i < 360; i += 15) {
            (game.createObject as any)(
                LooseTire,
                center.plus(Vector.lengthAndDirection(900, Angle.degrees(i))),
            );
        }

        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}

import { game, GameObject, Vector } from 'engine';
import { Car } from './car';
import { LooseTire } from './loose-tire';

export class MainObject extends GameObject {

    public onCreate() {
        (game.createObject as any)(
            Car,
            Vector.xy(60, 500),
            {
                topSpeed: 0.01,
                acceleration: 0.0005,
                spinning: 0.0001,
                cornering: 0.00003,
                handling: 0.3,
            },
        );
        (game.createObject as any)(
            LooseTire,
            Vector.xy(200, 250),
        );
        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}

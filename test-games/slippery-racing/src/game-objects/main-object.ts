import { game, GameObject, Vector } from 'engine';
import { Camera } from './camera';
import { Car } from './car';
import { LooseTire } from './loose-tire';

export class MainObject extends GameObject {

    public onCreate() {
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
        (game.createObject as any)(
            LooseTire,
            Vector.xy(400, 500),
        );
        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}

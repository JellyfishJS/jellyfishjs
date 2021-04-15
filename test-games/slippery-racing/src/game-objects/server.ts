import { Angle, game, Server, User, Vector } from 'engine';
import { Car } from './car';
import { Decoration } from './decoration';
import { LooseTire } from './loose-tire';
import { SoccerBall } from './soccer-ball';
import { Track } from './track';

export class SlipperServer extends Server {

    private generateCircle(center: Vector, size: number) {
        this.createObject(Decoration, center, size + 460, 0x888888);
        this.createObject(Decoration, center, size + 450, 0xd7d7d7);
        this.createObject(Decoration, center, size + 300, 0x44bf4d);
        this.createObject(Decoration, center, size + 10, 0x3e7242, true);
        this.createObject(Decoration, center, size, 0x45824a);
    }

    private generateTireCircle(center: Vector, size: number, amount: number) {
        for (let i = 0; i < 360; i += 360 / amount) {
            this.createObject(
                LooseTire,
                center.plus(Vector.lengthAndDirection(size, Angle.degrees(i))),
            );
        }

        for (let i = 180 / amount; i < 360; i += 360 / amount) {
            this.createObject(
                LooseTire,
                center.plus(Vector.lengthAndDirection(size + 100, Angle.degrees(i))),
            );
        }
    }

    public onCreate() {

        this.generateCircle(Vector.xy(-1000, -1900), 200);
        this.generateCircle(Vector.xy(3400, -1160), 300);
        this.generateCircle(Vector.xy(4900, -2200), 500);
        this.generateCircle(Vector.xy(3300, -3300), 400);
        this.generateCircle(Vector.xy(1000, -4600), 800);
        this.generateCircle(Vector.xy(-2900, -2600), 400);
        this.generateCircle(Vector.xy(-5100, -600), 600);
        this.generateCircle(Vector.xy(-3000, 300), 200);
        this.generateCircle(Vector.xy(-2500, -100), 700);

        this.createObject(
            Track,
            Vector.xy(0, -1400),
        );

        // this.generateCircle(Vector.xy(-1900, 1500), 800);
        // this.generateCircle(Vector.xy(-1900, -2200), 150);
        // this.generateCircle(Vector.xy(1900, -2700), 150);
        // this.generateCircle(Vector.xy(2900, -2400), 250);

        this.createObject(
            SoccerBall,
            Vector.xy(0, -1400),
        );

        this.game().getWorld()!.gravity = { x: 0, y: 0, scale: 0 };

        this.start(+process.env.SLIPPERY_RACING_PORT!);
    }

    public onUserLeft(user: User) {
        for (const child of this.children()) {
            if (child.getOwner()?.id() === user.id()) {
                if (child instanceof Car) {
                    child.remove();
                }
            }
        }
    }

}
game.registerClass(SlipperServer);

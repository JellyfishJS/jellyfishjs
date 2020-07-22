import { Client, game } from 'engine';

export class SlipperyClient extends Client {

    public onCreate() {
        this.game().getWorld()!.gravity = { x: 0, y: 0, scale: 0 };

        this.connect();
    }

}
game.registerClass(SlipperyClient);

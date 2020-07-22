import { Client, game } from 'engine';

export class SlipperyClient extends Client {

    public onCreate() {
        this.connect();
    }

}
game.registerClass(SlipperyClient);

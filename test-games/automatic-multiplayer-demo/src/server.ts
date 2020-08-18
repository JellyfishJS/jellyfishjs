import { Server as JellyfishServer } from 'engine';

export class Server extends JellyfishServer {
    public onCreate() {
        this.start(+process.env.MULTIPLAYER_CIRCLES_PORT!);
    }
}

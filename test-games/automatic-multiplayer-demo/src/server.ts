import { Server as JellyfishServer } from 'jellyfish.js';

export class Server extends JellyfishServer {
    public onCreate() {
        this.start(+process.env.MULTIPLAYER_CIRCLES_PORT!);
    }
}

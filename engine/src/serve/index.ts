import type * as HTTPType from 'http';
import type * as PathType from 'path';
import { isServer } from '../multiplayer';

export function serve(port: number = 8000) {

    if (!isServer) { return; }

    // @ts-ignore
    const http: typeof HTTPType = __non_webpack_require__('http');
    // serve-handler is not compatible with importing types.
    // @ts-ignore
    const handler: any = __non_webpack_require__('serve-handler');
    // @ts-ignore
    const path: typeof PathType = __non_webpack_require__('path');

    // Webpack, for some reason, replaces __dirname and __filename with its own value.
    // This is the only way to access the real values.
    // They aren't on any global objects, they just float around in the global namespace.
    // eval is usually bad, but this is on a constant string, so it's safe.
    // tslint:disable-next-line:no-eval
    const dirname: string = eval('__dirname');
    // tslint:disable-next-line:no-eval
    const filepath: string = eval('__filename');
    const filename: string = path.basename(filepath);

    http
        .createServer((request, response) => {
            if (request.method === 'GET' && request.url === '/') {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(`<canvas width=800 height=600 id="game" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></canvas><script src="./${filename}"></script>`);
                response.end();
                return;
            }
            handler(request, response, {
                public: dirname,
                directoryListing: false,
            });
        })
        .listen(port)
        .on('listening', () => {
            console.log(`View the game at http://localhost:${port}`);
        });
}

import type * as HTTPType from 'http';
import type * as PathType from 'path';
import type * as FSType from 'fs';
import { isServer } from '../multiplayer';

/**
 * Options for serving the game.
 *
 * All options are optional.
 *
 * If the port is not specified,
 * a default of 3000 is used.
 *
 * You can override the default page HTML
 * by passing a string containing HTML to the html option,
 * or by passing a path to an html file.
 * Paths are relative to the current directory
 * of the user running the game.
 */
export interface ServeOptions {
    port?: number;
    html?: string;
    htmlFilePath?: string;
}

/**
 * Serves an HTML file where you can play the game.
 *
 * This is meant for development.
 * For production, you can load the game on any page,
 * served however you like.
 *
 * See `ServeOptions` for options.
 *
 * This does nothing when run client-side.
 */
export async function serve({ port = 3000, html, htmlFilePath }: ServeOptions = {}) {
    if (!isServer) { return; }

    // @ts-ignore
    const http: typeof HTTPType = __non_webpack_require__('http');
    // @ts-ignore
    const path: typeof PathType = __non_webpack_require__('path');
    // @ts-ignore
    const fs: typeof FSType = __non_webpack_require__('fs');

    let handler: any;

    try {
        // serve-handler is not compatible with importing types.
        // @ts-ignore
        handler = __non_webpack_require__('serve-handler');
    } catch (error) {
        throw new Error(
            'Cannot run test server without package `serve-handler`. To install `serve-hander` run:'
            + '\n\n    npm install serve-handler\n',
        );
    }

    // Webpack, for some reason, replaces __dirname and __filename with its own value.
    // This is the only way to access the real values.
    // They aren't on any global objects, they just float around in the global namespace.
    // eval is usually bad, but this is on a constant string, so it's safe.
    // tslint:disable-next-line:no-eval
    const dirname: string = eval('__dirname');
    // tslint:disable-next-line:no-eval
    const filepath: string = eval('__filename');
    const filename: string = path.basename(filepath);

    const defaultPageHTML = `<canvas width=800 height=600 id="game" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></canvas><script src="./${filename}"></script>`;
    let pageHTML: string | undefined;

    if (htmlFilePath) {
        const result = await new Promise<string | undefined>((resolve) => {
            fs.readFile(htmlFilePath, 'utf8', (error, data) => {
                if (error) { resolve(undefined); }
                resolve(data);
            });
        });
        pageHTML = result;
    }
    pageHTML = pageHTML || html || defaultPageHTML;

    http
        .createServer((request, response) => {
            if (request.method === 'GET' && request.url === '/') {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(pageHTML);
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

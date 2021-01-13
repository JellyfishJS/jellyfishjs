import type * as HTTPType from 'http';

export function serve(port: number = 8000) {

    // @ts-ignore
    const http: typeof HTTPType = __non_webpack_require__('http');
    // @ts-ignore
    const handler: any = __non_webpack_require__('serve-handler');
    // serve-handler is not compatible with importing types.

    http
        .createServer((request, response) => {
            if (request.method === 'GET' && request.url === "/") {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(`<canvas width=400 height=300 id="game" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></canvas><script src="./dist/index.js"></script>`);
                response.end();
                return;
            }
            handler(request, response);
        })
        .listen(port)
        .on('listening', () => {
            console.log(`View the game at http://localhost:${port}`);
        });
}

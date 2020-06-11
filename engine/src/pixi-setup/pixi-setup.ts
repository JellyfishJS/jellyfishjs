import type * as PIXIForType from 'pixi.js';

let PIXI: typeof PIXIForType | undefined;

try {
    PIXI = require('pixi.js') as typeof PIXIForType;

    // PIXI puts a fancy message in the console,
    // unless you disable it.
    PIXI.utils.skipHello();
} catch {
    // In node, requiring PIXI errors.
    // This is okay, it just means there will be no display.
}

/**
 * Sets up a PIXI app.
 */
export class PIXISetup {

    /**
     * The PIXI Application this PIXISetup provides.
     */
    private readonly _application: PIXI.Application | undefined;

    /**
     * Constructs a PIXISetup, with, optionally,
     * an id with which to find the canvas.
     *
     * If no id is provided, use `.getCanvas()` to get a canvas element.
     */
    public constructor(id?: string) {
        let canvas: HTMLCanvasElement | undefined;

        if (!PIXI) { return; }

        if (window && id) {
            const view = window.document.getElementById(id);
            if (view instanceof HTMLCanvasElement) {
                canvas = view;
            } else {
                console.error(`Could not find canvas with id "${id}".`);
            }
        }

        this._application = new PIXI.Application({
            view: canvas || undefined,
            height: canvas?.height || 300,
            width: canvas?.width || 300,
            resolution: 1,
            antialias: true,
        });
    }

    /**
     * Returns the canvas element that the PIXI application this contains uses.
     */
    public getCanvas() {
        return this._application?.view;
    }

    /**
     * Returns the canvas element that the PIXI application this contains uses.
     */
    public getApplication() {
        return this._application;
    }

    /**
     * Returns the container at the root of the canvas.
     */
    public getContainer() {
        return this._application?.stage;
    }

    /**
     * Executes the specified callback every frame.
     */
    public onInterval(callback: () => void) {
        if (this._application) {
            this._application.ticker.add(callback);
        } else {
            setInterval(callback, 1000 / 60);
        }
    }

}

export { PIXI };

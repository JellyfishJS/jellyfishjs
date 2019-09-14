import * as PIXI from "pixi.js";

// PIXI puts a fancy message in the console,
// unless you disable it.
PIXI.utils.skipHello();

/**
 * Sets up a PIXI app.
 */
export class PIXIProvider {

    /**
     * The PIXI Application this PIXIProvider provides.
     */
    private readonly _application: PIXI.Application;

    /**
     * Constructs a PIXIProvider, with, optionally,
     * an id with which to find the canvas.
     *
     * If no id is provided, use `.getCanvas()` to get a canvas element.
     */
    public constructor(id?: string) {
        let canvas: HTMLCanvasElement | undefined;
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
            height: canvas && canvas.height || 300,
            width: canvas && canvas.width || 300,
            resolution: window && window.devicePixelRatio || 1,
            antialias: true,
        });
    }

    /**
     * Returns the canvas element that the PIXI application this contains uses.
     */
    public getCanvas() {
        return this._application.view;
    }

    /**
     * Returns the container at the root of the canvas.
     */
    public getContainer() {
        return this._application.stage;
    }

    /**
     * Executes the specified callback every frame.
     */
    public onInterval(callback: () => void) {
        this._application.ticker.add(callback);
    }

}

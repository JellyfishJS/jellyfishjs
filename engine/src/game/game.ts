import { GameLoop } from "../game-loop/game-loop";
import { GameObject } from "../game-object/game-object";
import { PIXIProvider } from "../pixi-provider/pixi-provider";

/**
 * Represents separate games.
 *
 * Unless you want multiple games running at the same time,
 * use the default `game`.
 */
export class Game {

    /**
     * The GameLoop for this game.
     *
     * Holds the GameObjects and performs appropriate actions on them.
     */
    private readonly _gameLoop = new GameLoop();

    private _pixiProvider: PIXIProvider | undefined;

    /**
     * Creates an instance of a specified subclass of GameObject,
     * and adds it to this game.
     *
     * Any arguments after the first are passed to the GameObject subclass's constructor.
     */
    public createObject<Subclass extends GameObject, Args extends readonly []>(
        Class: new (...args: Args) => Subclass,
        ...args: Args
    ) {
        const newObject = new Class(...args);
        this._gameLoop.addGameObject(newObject);
    }

    /**
     * Sets the canvas on which this game draws to the one with the specified ID.
     */
    public setCanvasByID(id: string) {
        this._pixiProvider = new PIXIProvider(id);
    }

    /**
     * Returns the canvas on which this game is drawn.
     */
    public getCanvas() {
        if (!this._pixiProvider) {
            this._pixiProvider = new PIXIProvider();
        }

        return this._pixiProvider.getCanvas();
    }

    /**
     * Begins running the game.
     */
    public start() {
        if (!this._pixiProvider) {
            this._pixiProvider = new PIXIProvider();
        }

        this._pixiProvider.onInterval(() => this._gameLoop.runLoop(this._pixiProvider));
    }

}

/**
 * The default game.
 *
 * Use this, unless you need multiple instances.
 */
export const game = new Game();

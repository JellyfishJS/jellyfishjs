import { GameLoop } from '../game-loop/game-loop';
/**
 * The keyboard class maintains the current state of the keyboard and can be queried
 * for the state of each key
 */

export enum KeyState {
    Down = 'DOWN',
    Up = 'UP',
}

export enum KeyEvent {
    Pressed = 'PRESSED',
    Released = 'RELEASED',
    HeldDown = 'HELDDOWN',
}

export class Keyboard {
    /**
     * The current state of each key in the keyboard, true means a key is down
     * a falsey value means the key is up
     */
    private keyboardState: Map<number, KeyState> = new Map();
    /**
     * The queue of all keyboard events that occurred since the last time processEvents was called
     */
    private keyboardEvents: { keyCode: number, keyState: KeyState }[] = [];

    public constructor() {
        if (typeof window !== 'undefined') {
            window.document.addEventListener(
                'keydown', (event) => {
                    this.addEvent(event, KeyState.Down);
                },
            );
            window.document.addEventListener(
                'keyup', (event) => {
                    this.addEvent(event, KeyState.Up);
                },
            );
        }
    }

    /**
     * Callback for handling key events that come from Javascript
     * @param event
     * @param keyState
     */
    private addEvent(event: KeyboardEvent, keyState: KeyState) {
        if (!event.repeat) {
            this.keyboardEvents.push({ keyCode: event.keyCode, keyState });
        }
    }

    /**
     * Loops through all of the key events in keyboardEvents, updates the keyboardState based
     * on each event and removes the event from the queue.
     * @param gameLoop: the gameloop to dispatch the processed keyboard events to
     */
    public processEvents(gameLoop: GameLoop): void {
        for (const keyboardEvent of this.keyboardEvents) {
            if (keyboardEvent.keyState === KeyState.Down) {
                gameLoop.dispatchKeyEvent(keyboardEvent.keyCode, KeyEvent.Pressed);
                this.keyboardState.set(keyboardEvent.keyCode, keyboardEvent.keyState);
            } else { // Key is up
                gameLoop.dispatchKeyEvent(keyboardEvent.keyCode, KeyEvent.Released);
                this.keyboardState.delete(keyboardEvent.keyCode);
            }
        }

        for (const [keyCode, keyState] of this.keyboardState) {
            if (keyState === KeyState.Down) {
                gameLoop.dispatchKeyEvent(keyCode, KeyEvent.HeldDown);
            }
        }
        this.keyboardEvents = [];
    }

    /**
     * Returns true if the key with the keycode currently has the keySate specified, false otherwise.
     * @param keyState
     * @param keyCode
     */
    public is(keyState: KeyState, keyCode: number) {
        return this.keyboardState.get(keyCode) === keyState || keyState === KeyState.Up;
    }

    /**
     * Returns true if the key with the keycode is currently up, false otherwise.
     * @param keyCode The keycode to check the state of.
     */
    public isUp(keyCode: number): boolean {
        return this.is(KeyState.Up, keyCode);
    }

    /**
     * Returns true if the key with the keycode is currently down, false otherwise.
     * @param keyCode The keycode to check the state of.
     */
    public isDown(keyCode: number): boolean {
        return this.is(KeyState.Down, keyCode);
    }
}

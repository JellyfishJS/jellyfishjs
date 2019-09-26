/**
 * The keyboard class maintains the current state of the keyboard and can be queried
 * for the state of each key
 */
export class Keyboard {
    /**
     * The current state of each key in the keyboard, true means a key is down
     * a falsey value means the key is up
     */
    private keyboardState: Map<number, boolean> = new Map();
    /**
     * The queue of all keyboard events that occurred since the last time processEvents was called
     */
    private keyboardEvents: { keyCode: number, state: boolean }[] = [];

    public constructor() {
        window && window.document.addEventListener(
            'keydown', (event) => { this.keyboardEvents.push( {keyCode: event.keyCode, state: true} ); },
        );
        window && window.document.addEventListener(
            'keyup', (event) => {this.keyboardEvents.push( {keyCode: event.keyCode, state: false} ); },
        );
    }

    /**
     * Loops through all of the key events in keyboardEvents, updates the keyboardState based
     * on each event and removes the event from the queue.
     */
    public processEvents(): void {
        for (const keyboardEvent of this.keyboardEvents) {
            if (keyboardEvent.state) {
                this.keyboardState.set(keyboardEvent.keyCode, keyboardEvent.state);
            } else {
                this.keyboardState.delete(keyboardEvent.keyCode);
            }
        }
        this.keyboardEvents = [];
    }

    /**
     * Returns true if the key with the keycode is currently up, false otherwise.
     * @param keyCode The keycode to check the state of.
     */
    public isUp(keyCode: number): boolean {
        return !this.keyboardState.get(keyCode);
    }

    /**
     * Returns true if the key with the keycode is currently down, false otherwise.
     * @param keyCode The keycode to check the state of.
     */
    public isDown(keyCode: number): boolean {
        return this.keyboardState.get(keyCode) || false;
    }
}

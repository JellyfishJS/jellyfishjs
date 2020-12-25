/**
 * The input class maintains the current state of the mouse and keyboard and can be queried
 * for the state of each key and mouse button
 */

export enum ButtonState {
    Down = 'DOWN',
    Up = 'UP',
}

export enum ButtonEvent {
    Pressed = 'PRESSED',
    Released = 'RELEASED',
    HeldDown = 'HELDDOWN',
}

// The maximum value of keycodes returned by KeyEvent.keyCode, appears to be less than 222 for English keyboards
const maxKeyCode = 222;

export class Input {
    /**
     * The current state of each key and mouse button, true means a key or mouse button is down
     * a falsey value means the key or mouse button is up
     */
    private inputState = new Map<number, ButtonState>();
    /**
     * The queue of all input events that occurred since the last time processEvents was called
     */
    private inputEvents: { buttonCode: number, buttonState: ButtonState }[] = [];

    public constructor() {
        if (typeof window !== 'undefined') {
            window.document.addEventListener(
                'keydown', (event) => {
                    this.addEvent(event, ButtonState.Down);
                },
            );
            window.document.addEventListener(
                'keyup', (event) => {
                    this.addEvent(event, ButtonState.Up);
                },
            );
            window.document.addEventListener(
                'mousedown', (event) => {
                    this.addEvent(event, ButtonState.Down);
                },
            );
            window.document.addEventListener(
                'mouseup', (event) => {
                    this.addEvent(event, ButtonState.Up);
                },
            );
            window.document.addEventListener(
                'contextmenu', (event) => {
                    event.preventDefault();
                },
            );
        }
    }

    /**
     * Callback for handling key press and mouse click events that come from Javascript
     * @param event
     * @param buttonState
     */
    private addEvent(event: Event, buttonState: ButtonState) {
        if (event instanceof KeyboardEvent) {
            if (!event.repeat) {
                this.inputEvents.push({ buttonCode: event.keyCode, buttonState });
            }
        } else if (event instanceof MouseEvent) {
            this.inputEvents.push({ buttonCode: this.mouseCode(event.button), buttonState });
        }
    }

    /**
     * Loops through all of the key  and mouse events in inputEvents, updates the inputState based
     * on each event and removes the event from the queue.
     * @param dispatchInputEvent: the callback to call with the processed input events
     */
    public processEvents(dispatchInputEvent: (inputCode: number, eventType: ButtonEvent) => void): void {
        for (const inputEvent of this.inputEvents) {
            if (inputEvent.buttonState === ButtonState.Down) {
                dispatchInputEvent(inputEvent.buttonCode, ButtonEvent.Pressed);
                this.inputState.set(inputEvent.buttonCode, inputEvent.buttonState);
            } else { // Button is up
                dispatchInputEvent(inputEvent.buttonCode, ButtonEvent.Released);
                this.inputState.delete(inputEvent.buttonCode);
            }
        }

        for (const [buttonCode, buttonState] of this.inputState) {
            if (buttonState === ButtonState.Down) {
                dispatchInputEvent(buttonCode, ButtonEvent.HeldDown);
            }
        }
        this.inputEvents = [];
    }

    /**
     * Returns true if the button with the buttonCode currently has the buttonState specified, false otherwise.
     * @param buttonState
     * @param buttonCode
     */
    public is(buttonState: ButtonState, buttonCode: number) {
        return this.inputState.get(buttonCode) === buttonState || buttonState === ButtonState.Up;
    }

    /**
     * Returns true if the button with the buttonCode is currently up, false otherwise.
     * @param buttonCode The keycode to check the state of.
     */
    public isUp(buttonCode: number): boolean {
        return this.is(ButtonState.Up, buttonCode);
    }

    /**
     * Returns true if the button with the buttonCode is currently down, false otherwise.
     * @param buttonCode The keycode to check the state of.
     */
    public isDown(buttonCode: number): boolean {
        return this.is(ButtonState.Down, buttonCode);
    }

    /**
     * Returns the buttonCode (code used for inputEvents) based on the mouse button specified
     * @param mouseButton The mouseButton pressed during the event for most systems 0 is left click, 1 is middle click,
     * 2 is right click, this is the value returned by MouseEvent.button
     */
    public mouseCode(mouseButton: number) {
        return maxKeyCode + mouseButton;
    }

    /**
     * Returns the mouseButton based on the buttonCode (code used for inputEvents) specified
     * @param mouseCode The code used for inputEvents
     */
    public mouseButton(mouseCode: number) {
        return mouseCode - maxKeyCode;
    }
}

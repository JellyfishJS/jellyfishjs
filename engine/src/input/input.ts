import { Vector } from '../util/geometry';

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

type InputEvent =
    | { type: 'button', buttonCode: number, buttonState: ButtonState }
    | { type: 'mouseMove', x: number, y: number };

/**
 * The input class maintains the current state of the mouse and keyboard and can be queried
 * for the state of each key and mouse button
 */
export class Input {

    /**
     * The mouse location on the previous step.
     */
    private _previousMouseLocation: Vector | undefined;

    /**
     * The mouse location on this step.
     */
    private _mouseLocation: Vector | undefined;

    /**
     * The current state of each key and mouse button, true means a key or mouse button is down
     * a falsey value means the key or mouse button is up
     */
    private inputState = new Map<number, ButtonState>();

    /**
     * The queue of all input events that occurred since the last time processEvents was called
     */
    private inputEvents: InputEvent[] = [];

    public constructor() {
        if (typeof window !== 'undefined') {
            window.document.addEventListener(
                'keydown', (event) => {
                    this.addButtonEvent(event, ButtonState.Down);
                },
            );
            window.document.addEventListener(
                'keyup', (event) => {
                    this.addButtonEvent(event, ButtonState.Up);
                },
            );
            window.document.addEventListener(
                'mousedown', (event) => {
                    this.addButtonEvent(event, ButtonState.Down);
                },
            );
            window.document.addEventListener(
                'mouseup', (event) => {
                    this.addButtonEvent(event, ButtonState.Up);
                },
            );
            window.document.addEventListener(
                'contextmenu', (event) => {
                    event.preventDefault();
                },
            );
            window.document.addEventListener(
                'mousemove', (event) => {
                    this.addMouseMoveEvent(event);
                },
            );
        }
    }

    /**
     * Records key press and mouse click events, to be handled by `processEvents`.
     * @param event
     * @param buttonState
     */
    private addButtonEvent(event: Event, buttonState: ButtonState) {
        if (event instanceof KeyboardEvent) {
            if (!event.repeat) {
                this.inputEvents.push({ type: 'button', buttonCode: event.keyCode, buttonState });
            }
        } else if (event instanceof MouseEvent) {
            this.inputEvents.push({ type: 'button', buttonCode: this.mouseCode(event.button), buttonState });
        }
    }

    /**
     * Records mouse movement events, to be handled by `processEvents`.
     */
    private addMouseMoveEvent(event: MouseEvent) {
        this.inputEvents.push({ type: 'mouseMove', x: event.clientX, y: event.clientY });
    }

    /**
     * Loops through all of the key  and mouse events in inputEvents, updates the inputState based
     * on each event and removes the event from the queue.
     * @param dispatchInputEvent: the callback to call with the processed input events
     */
    public processEvents(dispatchInputEvent: (inputCode: number, eventType: ButtonEvent) => void): void {
        this._previousMouseLocation = this._mouseLocation;
        for (const inputEvent of this.inputEvents) {
            switch (inputEvent.type) {
                case 'button':
                    if (inputEvent.buttonState === ButtonState.Down) {
                        dispatchInputEvent(inputEvent.buttonCode, ButtonEvent.Pressed);
                        this.inputState.set(inputEvent.buttonCode, inputEvent.buttonState);
                    } else { // Button is up
                        dispatchInputEvent(inputEvent.buttonCode, ButtonEvent.Released);
                        this.inputState.delete(inputEvent.buttonCode);
                    }
                    break;
                case 'mouseMove':
                    this._mouseLocation = Vector.xy(inputEvent.x, inputEvent.y);
                    break;
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
     * Returns the coordinates of the mouse's current location.
     *
     * May return undefined, if the mouse cannot be found.
     */
    public mouseLocation(): Vector | undefined {
        return this._mouseLocation;
    }

    /**
     * Returns the coordinates of the mouse's location the previous step.
     *
     * May return undefined, if the mouse cannot be found.
     */
    public previousMouseLocation(): Vector | undefined {
        return this._previousMouseLocation;
    }

    /**
     * Returns the movement of the mouse over the last step,
     * or undefined if it could not be found.
     */
    public mouseMovement(): Vector | undefined {
        if (!this._mouseLocation || !this._previousMouseLocation) { return; }
        return this._mouseLocation.minus(this._previousMouseLocation);
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

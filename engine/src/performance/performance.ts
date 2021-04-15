/**
 * How long a step in Jellyfish is supposed to take.
 */
const STEP_TIME = 1000 / 60;

/**
 * Handles how quickly and how often steps run.
 */
export class Performance {
    private _startTime = Date.now();
    private _numberOfSteps = 0;

    /**
     * How many steps the engine must fall behind
     * before 2 steps are run synchronously.
     */
    public readonly doubleStepThreshhold = 3;

    /**
     * Once the engine is this many steps behind, it gives up and resets the timer.
     * This is not idea, but this many simultaneous frames would be noticed.
     */
    public readonly timerResetThreshhold = 10;

    /**
     * Resets the start time and number of steps. Good for when you
    */
    public start(now: number) {
        this._startTime = now;
        this._numberOfSteps = 0;
    }

    public step() {
        this._numberOfSteps++;
    }

    public shouldStep(now: number) {
        const nextStep = this._startTime + this._numberOfSteps * STEP_TIME;
        return now > nextStep;
    }

    public amountBehind(now: number) {
        return (now - this._startTime) / STEP_TIME - this._numberOfSteps;
    }
}

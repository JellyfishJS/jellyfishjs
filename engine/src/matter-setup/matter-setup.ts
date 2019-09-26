import * as MatterForType from 'matter-js';

let Matter: typeof MatterForType | undefined;

try {
    Matter = require('matter-js') as typeof MatterForType;
} catch {
    // The user might not have matter as a dependency.
    // That is okay.
}

export { Matter };

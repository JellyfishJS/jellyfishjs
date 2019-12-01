# Running

This describes how to set up
and run development versions of Jellyfish.

## Installation

Clone this repository.

## Building

It is easiest to run the `./build` script
or the `build.bat` batch file
in the root directory
to set everything up initially.

However, it takes a while,
so it's nice to be able to rebuild only the things you need.

### Building the engine

1. Make sure all the required packages are installed.
    To do this, run `npm i` in the `./engine` directory.

    This only needs to be done initially,
    or whenever the dependencies change.

    Note the packages required to build Jellyfish
    are not available in production,
    so if `NODE_ENV` is set to `production`,
    run `NODE_ENV=development npm i`.

1. Build the engine,
    by running `npm run build`.
    Note any `NODE_ENV` works with this.

### Building test games

For whichever game engine you want to build:

1. Build the engine.

1. Install the engine and any dependencies
    by running `npm i` in the directory containing the game.

    This only needs to be done initially,
    or whenever the dependencies change
    or whenever the game engine is rebuilt.

1. Build the game,
    by running `npm run build`.

## Running

Once a test game is built:

1. Run the server,
    by running `npm start`.

1. Serve the game,
    by running `npm run serve`.

    This serves the game directory on `localhost:5000`.
    This isn't ideal since serves all the files in the directory,
    but it is sufficient.

1. Join the game,
    by going to http://localhost:5000/index.html.

# Testing

Game engines are reasonably hard to test,
so before any release the test games will have to be checked manually.

However, there are automated tests
to ensure there are no obvious errors.

Running `npm test` in the engine or one of the test games
will run any tests for that specific thing
that are available.

## Linting

The engine and some of the test games have a linter.
If it is available,
running `npm run lint`
will run the linter.

To automatically fix some linting issues,
run `npm run fix`
in any directory with linting.

## Unit Tests

The engine
and possibly in the future some of the test games
have unit tests for some parts of them.
Run `npm run unit-tests` to run the unit tests.

To add unit tests, look in the `test` directory
in the engine or the relevant test game.
If one does not exist,
there are no tests for that game.

## Coverage

Run `npm run coverage` to see coverage results
in the engine,
or possibly in the future some of the test games.
This will generate a coverage report in the `coverage` directory,
and also output a summary of the coverage results.

## CI Tests

The github actions
automatically run linting and unit tests
on the engine and all the test games.

It also runs each of the test game servers
to ensure it doesn't crash for 5 seconds.

They do this on node versions 8, 10, 12, and 13.

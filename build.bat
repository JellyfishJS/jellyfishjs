@echo off
pushd "%~dp0"

pushd engine
call npm install
call npm run build
call npm pack
popd

for /d %%i in (test-games\*) do (
    pushd "%%~i"
    if exist package.json (
        call npm install
        call npm run build
    )
    popd
)
popd

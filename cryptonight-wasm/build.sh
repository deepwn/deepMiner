#!/bin/bash
emcc crypto/*.c -Oz \
    -s DISABLE_EXCEPTION_CATCHING=1 \
    -s BINARYEN_ASYNC_COMPILATION=1 \
    -s ALIASING_FUNCTION_POINTERS=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s WASM=1 \
    -s BINARYEN=1 \
    -s NO_EXIT_RUNTIME=1 \
    -s ASSERTIONS=1 \
    -s STACK_OVERFLOW_CHECK=1 \
    -s EXPORTED_FUNCTIONS="['_cryptonight_hash']" \
    --post-js ../web/lib/worker.js \
    -o ../web/lib/cryptonight.js

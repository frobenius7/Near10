#!/bin/bash
ID=vladkens.testnet
CN=challenge-7.$ID

yarn contr:build
near deploy $CN --wasmFile out/main.wasm
near state $CN
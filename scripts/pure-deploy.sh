#!/bin/bash
ID=vladkens.testnet
CN=challenge-7.$ID

yarn contr:build

near delete $CN $ID
near create-account $CN --masterAccount $ID

near deploy $CN --wasmFile out/main.wasm
near state $CN

near call $CN add_candidate '{"candidate": "abc"}' --accountId $ID
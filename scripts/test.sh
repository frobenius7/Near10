#!/bin/bash

yarn contr:dev

source neardev/dev-account.env
CN=$CONTRACT_NAME

# near call $CN add_candidate '{"candidate": "abc"}' --accountId $CN
near view $ID get_candidates
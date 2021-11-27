### API

```bash
# get list of candidates and theirs votes
near view challenge-7.vladkens.testnet get_candidates

# add new candidate
# in case if candidate name exists -> error
near call challenge-7.vladkens.testnet add_candidate '{"candidate": "abc"}' --accountId $ID

# vote for candidate
# in case if candidate name not exists -> error
# in case if account already vote for this candidate -> error
near call challenge-7.vladkens.testnet vote '{"candidate": "abc"}' --accountId $ID
```

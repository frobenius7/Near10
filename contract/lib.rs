use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupSet, UnorderedMap, LookupMap};
use near_sdk::{near_bindgen, BorshStorageKey, env};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKeys {
    Candidates,
    Voters,
    Votes,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Candidate {
    pub id: u32,
    pub votes: u32,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub candidate_counter: u32,
    pub voter_counter: u32,
    pub candidates: UnorderedMap<String, Candidate>, // candidatName & votes
    pub voters: LookupMap<String, u32>, // accountId
    pub votes: LookupSet<String>, // candidateId_accoundId
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            candidate_counter: 0,
            voter_counter: 0,
            candidates: UnorderedMap::new(StorageKeys::Candidates),
            voters: LookupMap::new(StorageKeys::Voters),
            votes: LookupSet::new(StorageKeys::Votes),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn add_candidate(&mut self, candidate: String) {
        assert!(self.candidates.get(&candidate).is_none(), "candidate already exists");

        let c = Candidate { id: self.candidate_counter, votes: 0 };
        self.candidates.insert(&candidate, &c);
        self.candidate_counter += 1;
    }

    pub fn get_candidates(&self) -> Vec<(String, Candidate)> {
        self.candidates.to_vec()
    }

    pub fn vote(&mut self, candidate: String) -> u32 {
        let mut c: Candidate;
        match self.candidates.get(&candidate) {
            None => {
                env::panic("We don't have this candidate in list".as_bytes());
            }
            Some(v) => {
                c = v;
            }
        }

        let voter = env::predecessor_account_id();
        let voter_id;
        match self.voters.get(&voter) {
            None => {
                voter_id = self.voter_counter;
                self.voters.insert(&voter, &self.voter_counter);
                self.voter_counter += 1;
            }
            Some(v) => {
                voter_id = v;
            }
        }

        let vote_id = [c.id.to_string(), voter_id.to_string()].join("_");
        assert!(!self.votes.contains(&vote_id), "You have already voted!");

        c.votes += 1;
        self.candidates.insert(&candidate, &c);
        self.votes.insert(&vote_id);

        c.votes
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::{MockedBlockchain, testing_env};
    use near_sdk::test_utils::VMContextBuilder;

    #[test]
    fn test_add_candidate() {
        let ctx = VMContextBuilder::new();
        testing_env!(ctx.build());
        
        let mut contract = Contract::default();

        let s = contract.get_candidates();
        assert_eq!(0, s.len());

        contract.add_candidate("abc".to_string());

        let s = contract.get_candidates();
        assert_eq!(1, s.len());
        assert_eq!("abc".to_string(), s[0].0);

        let c = &s[0].1;
        assert_eq!(0, c.id);
        assert_eq!(0, c.votes);

        contract.add_candidate("xyz".to_string());
        let s = contract.get_candidates();
        assert_eq!(2, s.len());

        let c = &s[1].1;
        assert_eq!(1, c.id);
        assert_eq!(0, c.votes);
    }

    #[test]
    #[should_panic]
    fn test_cant_add_same_candidate_twice() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let mut contract = Contract::default();

        contract.add_candidate("abc".to_string());
        contract.add_candidate("abc".to_string());
    }

    #[test]
    fn test_vote() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let mut contract = Contract::default();

        contract.add_candidate("abc".to_string());
        contract.vote("abc".to_string());

        let s = contract.get_candidates();
        assert_eq!(1, s.len());
        assert_eq!(1, (s[0].1).votes);
    }

    #[test]
    #[should_panic]
    fn test_cant_vote_for_unexists() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let mut contract = Contract::default();

        contract.vote("abc".to_string());
    }

    #[test]
    #[should_panic]
    fn test_cant_vote_twice_for_same() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let mut contract = Contract::default();

        contract.add_candidate("abc".to_string());
        contract.vote("abc".to_string());
        contract.vote("abc".to_string());
    }

    #[test]
    fn test_can_vote_for_different() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let mut contract = Contract::default();

        contract.add_candidate("abc".to_string());
        contract.add_candidate("xyz".to_string());

        contract.vote("abc".to_string());
        contract.vote("xyz".to_string());

        let s = contract.get_candidates();
        assert_eq!(2, s.len());
        assert_eq!(1, (s[0].1).votes);
        assert_eq!(1, (s[1].1).votes);
    }

    #[test]
    fn test_different_can_vote() {
        let mut context = VMContextBuilder::new();
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_candidate("abc".to_string());
        contract.vote("abc".to_string());

        context.predecessor_account_id("alice.testnet".to_string().try_into().unwrap());
        contract.vote("abc".to_string());

        // let c = contract.get_candidates();
    }
}
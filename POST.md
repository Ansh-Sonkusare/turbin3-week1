Draft X thread for the Week 1 submission. Not part of the code. Delete this file before you push if you don't want it in the repo.

---

1/ Turbin3 Q4 Builders Cohort, Week 1: I ran a full token and NFT lifecycle on Solana devnet with Metaplex Umi.

Mint an SPL token → transfer it → mint a Core NFT → update it → transfer it → burn it.

Code + every tx: <REPO_LINK> 🧵

2/ SPL tokens are several accounts. The mint holds supply and decimals. Each holder's balance lives in an associated token account (ATA) derived from (owner, mint). To send tokens to a new wallet, you first create its ATA, and the sender pays the rent.

3/ Metaplex Core stores an NFT in one account: owner, update authority, name, and URI. The older Token Metadata standard needs 4 accounts. With Core, minting is 1 instruction and a transfer changes 1 field.

4/ Owner and update authority are separate roles. After I transferred the NFT, I could still update its metadata, but I couldn't move or burn it. The burn needed the new owner's signature.

5/ The surprise: burn didn't return all the rent. Core shrinks the asset to a 1-byte "tombstone" so the address can't be reused. The tombstone keeps its 1-byte rent plus Core's 0.0015 SOL protocol fee. I checked the numbers on-chain and they matched to the lamport.

6/ Devnet lesson: the tx confirmed, and the next simulation still said the mint didn't exist. The load-balanced RPC sent me to a node that was behind. Fix: use finalized commitment and make the scripts safe to re-run.

7/ Use cases: points and in-game currency (SPL), tickets and memberships whose metadata changes (Core update), redeem-by-burn items where the tombstone stops double-redemption.

Thanks @solanaturbine 🙏

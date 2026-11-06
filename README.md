# Turbin3 Q4 2026: Week 1 (SPL Tokens and Metaplex Core NFTs)

TypeScript scripts that run the whole token and NFT lifecycle on Solana **devnet**, using [Umi](https://github.com/metaplex-foundation/umi), `mpl-toolbox`, and `mpl-core`.

| # | Task | Script |
|---|------|--------|
| 1 | Mint my own SPL token and transfer some to another wallet | `src/1-spl-token.ts` |
| 2 | Mint an NFT with Metaplex Core | `src/2-mint-nft.ts` |
| 3 | Update the NFT's name and metadata as its update authority | `src/3-update-nft.ts` |
| 4 | *(extension)* Transfer NFT ownership to another wallet | `src/4-transfer-nft.ts` |
| 5 | *(extension)* Burn the NFT and reclaim rent | `src/5-burn-nft.ts` |

## Run it

```bash
npm install
npm run token      # 1
npm run mint       # 2
npm run update     # 3
npm run transfer   # 4
npm run burn       # 5
```

- The payer is `~/.config/solana/id.json`. Set `WALLET=path/to/keypair.json` to use a different one. It needs about 0.02 devnet SOL (`solana airdrop 1` or https://faucet.solana.com).
- Set `RPC=...` to use an RPC other than `https://api.devnet.solana.com`.
- The first run creates a second wallet at `wallets/recipient.json` (gitignored). It receives the tokens and the NFT.
- Each step saves the addresses it creates to `state.json`, so the next step can find them.

## My devnet run

| Step | Result | Transaction |
|------|--------|-------------|
| Token mint | [`4x2W…rkNb`](https://explorer.solana.com/address/4x2WjbMq6ZS9bR6V3zxVJMgYvuScJB6eggpLWSVXrkNb?cluster=devnet), 6 decimals, 1,000,000 supply | [create + mint](https://explorer.solana.com/tx/44MeLeg72ySyj7m4L2wKGwJdkQAQL5BX4MR8WoV89iBPk7xWh6Ms9kqhsc9GDGEPgUtue57ayvbie5hc659zXznE?cluster=devnet) |
| Token transfer | 1,000 tokens to `3Hxi…kcTt`. My balance is 999,000. | [transfer](https://explorer.solana.com/tx/4u1MZNpmeLN7GpVKc7zD9M2KZ2rsfexHgEqS1DrTVbB7DVa4GaCMG6UHz2YZFfj21ryg1XDnuVHBu7GjBpBDHTmi?cluster=devnet) |
| NFT mint | Asset [`d3k7…id4T`](https://explorer.solana.com/address/d3k7kdvzAMAWeDZgowF9RtWrXy8mqURYP772cxfid4T?cluster=devnet), "Turbin3 Builder #1" | [create](https://explorer.solana.com/tx/44MF39fjmnnobyJqa6nTLD8FQEUmY3S15kXQ1rfNduxMtD1Eo8XZcrsGyd16N7VwcbPsgW4mGag4PCZT9HLScmJF?cluster=devnet) |
| NFT update | Name is now "Turbin3 Builder #1 (Evolved)". URI changed from `metadata/v1.json` to `metadata/v2.json`. | [update](https://explorer.solana.com/tx/5MKi8yKgFpuCbGs2h7j3g64sfWm8Z2B7BSj9xn7RzZep3aizZK6sAPULvNkmgumM9apTtaPAR5ixa41RvH8btTiZ?cluster=devnet) |
| NFT transfer | Owner changed from `H37w…249V` to `3Hxi…kcTt` | [transfer](https://explorer.solana.com/tx/4feaM8yw3S6H1Dsv2G12NYZ7DfA17PvB6A9RrvM4gR9WKmAduW5ebXmEGF9XH8C5hbNEidksfp6DjmkC2NHJc6zg?cluster=devnet) |
| NFT burn | The new owner signed the burn. 0.00094488 SOL of rent went back to the payer. | [burn](https://explorer.solana.com/tx/3yNLK8WScckd563B3HnNHSQaiBu53HK2QGy2GJ6xpNPYjXGxh83uns4RtFHYNwPds2nJKVzZFRgmVftczcT9HqSa?cluster=devnet) |

The off-chain metadata (`metadata/v1.json`, `metadata/v2.json`) and the SVG images are in this repo. They are served from `raw.githubusercontent.com`, so I did not need a paid storage upload.

## What I learned

**SPL tokens are several accounts.** A token is a *mint* account that holds the supply, decimals, and mint authority. Each holder has a separate *token account* that holds their balance. The *associated token account* (ATA) is a PDA derived from (owner, mint), so anyone can compute where a wallet's balance lives. To send tokens to a new wallet, you first create its ATA. The sender pays that rent. `createTokenIfMissing` does this in the same transaction as the transfer.

**Amounts are integers.** "1,000 tokens" with 6 decimals is `1_000n * 10n ** 6n` base units. I used `bigint` everywhere to avoid floating-point errors.

**Metaplex Core needs one account per NFT.** The older Token Metadata standard needs a mint, a token account, a metadata account, and a master edition account. Core keeps the owner, update authority, name, and URI in a single account. Minting is one instruction. Transfer changes one field. You do not create or close any ATAs.

**Owner and update authority are separate roles.** After step 4, I no longer owned the NFT, but I was still its update authority. I could still change its metadata, but I could not transfer or burn it. The burn needed the new owner's signature. My main wallet only paid the fees.

**Burn does not fully close the account.** I expected the burn to return all the rent. It returned only 0.00094488 of the 0.0031002 SOL in the account, so I checked the account after the burn. Core shrinks the asset to a **1-byte tombstone** instead of closing it. This stops anyone from creating a new asset at the same address and pretending it is the old one. The tombstone keeps:
- the rent for its 1 byte (0.00065532 SOL on devnet today)
- the **0.0015 SOL protocol fee** that Core adds at create time

The numbers check out exactly: the account had rent for 187 bytes (1,600,200 lamports) plus 1,500,000 lamports of fee.

**Devnet RPC reads can be stale.** The first transfer simulation failed with `IncorrectProgramId`, even though the mint transaction had confirmed. The load-balanced RPC sent my next request to a node that had not seen the new mint yet. I switched Umi to `finalized` commitment, and I made the token script skip creating the mint if one already exists, so a failed run can be retried safely.

## Where this applies

- **Loyalty points, in-game currency, governance tokens**: SPL mint plus transfers, as in step 1.
- **Tickets, memberships, certificates**: cheap single-account Core NFTs. Their metadata can change over time (for example, a ticket marked "used") while the asset stays the same, as in step 3.
- **Redeemable items**: the holder burns the NFT to redeem it, as in step 5. The tombstone means the same asset cannot be redeemed twice.
